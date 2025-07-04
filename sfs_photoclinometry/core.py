import numpy as np
from scipy.optimize import minimize
from scipy.ndimage import laplace, gaussian_filter
from tqdm import tqdm
from . import utils
import warnings

# Use a class to manage optimization state cleanly


class SFSCallback:
    def __init__(self, max_iter):
        self.pbar = tqdm(total=max_iter, desc="L-BFGS-B Optimization")
        self.iteration = 0

    def __call__(self, xk):
        self.pbar.update(1)
        self.iteration += 1

    def close(self):
        self.pbar.close()


def sfs_cost_and_gradient(Z_flat, observed_image, light_vec, lambda_reg, shape):
    """
    Optimized cost and gradient calculation for SFS.
    Includes numerical stability improvements and better gradient computation.
    """
    # --- Reshape Z from flat to 2D ---
    Z = Z_flat.reshape(shape)

    # --- Precompute gradients once ---
    p, q = np.gradient(Z)

    # --- 1. Brightness Cost Term ---
    predicted_image = utils.calculate_predicted_image(Z, light_vec)
    brightness_error = observed_image - predicted_image
    brightness_cost = 0.5 * np.sum(brightness_error**2)

    # --- 2. Smoothness Cost Term (Laplacian regularization) ---
    laplacian_Z = laplace(Z, mode='constant', cval=0.0)
    smoothness_cost = 0.5 * lambda_reg * np.sum(laplacian_Z**2)

    # --- 3. Total Cost ---
    total_cost = brightness_cost + smoothness_cost

    # --- 4. Optimized Gradient Computation ---
    # Compute surface normals more efficiently
    denom = np.sqrt(1 + p**2 + q**2)
    # Add numerical stability
    denom = np.maximum(denom, 1e-8)

    # Normal vector components
    nx = -p / denom
    ny = -q / denom
    nz = 1.0 / denom

    # Predicted reflectance using optimized dot product
    predicted_reflectance = np.maximum(0,
                                       nx * light_vec[0] + ny * light_vec[1] + nz * light_vec[2])

    # Gradient computation with improved numerical stability
    # Only compute gradient where reflectance > 0 (illuminated areas)
    mask = predicted_reflectance > 1e-6

    # Initialize gradient
    brightness_gradient = np.zeros_like(Z)

    if np.any(mask):
        # Compute derivatives only for illuminated pixels
        denom_masked = denom[mask]
        denom3 = denom_masked**3

        # Partial derivatives with respect to surface slopes
        dR_dp = (light_vec[0] * denom_masked + p[mask] *
                 (light_vec[0] * p[mask] + light_vec[1] * q[mask] + light_vec[2])) / denom3
        dR_dq = (light_vec[1] * denom_masked + q[mask] *
                 (light_vec[0] * p[mask] + light_vec[1] * q[mask] + light_vec[2])) / denom3

        # Chain rule: dCost/dZ = dCost/dR * dR/dp * dp/dZ + dCost/dR * dR/dq * dq/dZ
        dCost_dR = brightness_error[mask]

        # Compute gradient components
        grad_p = dCost_dR * dR_dp
        grad_q = dCost_dR * dR_dq

        # Create full gradient arrays
        full_grad_p = np.zeros_like(Z)
        full_grad_q = np.zeros_like(Z)
        full_grad_p[mask] = grad_p
        full_grad_q[mask] = grad_q

        # Divergence computation (more stable)
        brightness_gradient = - \
            np.gradient(full_grad_p, axis=1) - np.gradient(full_grad_q, axis=0)

    # --- Smoothness gradient (regularization) ---
    smoothness_gradient = lambda_reg * \
        laplace(laplacian_Z, mode='constant', cval=0.0)

    # --- Total Gradient ---
    total_gradient = brightness_gradient + smoothness_gradient

    return total_cost, total_gradient.flatten()


def run_sfs_optimization(image: np.ndarray, config: dict):
    """Optimized SFS optimization with better initialization and convergence."""
    height, width = image.shape
    print(f"Processing image of size: {height}x{width} pixels")

    # 1. Preprocess image for better convergence
    # Apply slight Gaussian smoothing to reduce noise
    smoothed_image = gaussian_filter(image, sigma=0.5)

    # 2. Get Light Vector from illumination geometry
    light_vec = utils.get_light_vector(
        config["sun_azimuth_deg"], config["sun_elevation_deg"]
    )
    print(f"Calculated Light Vector (X,Y,Z): {np.round(light_vec, 3)}")

    # 3. Smart initialization - use image intensity as initial height estimate
    if config["initial_surface"] == "flat":
        # Scale image intensities to reasonable height range
        Z_initial = (smoothed_image - 0.5) * 10.0  # Scale to ±5 units
    else:
        # Placeholder for loading a coarse DEM
        raise NotImplementedError("Loading initial DEM not yet implemented.")

    print(
        f"Initial height range: [{Z_initial.min():.2f}, {Z_initial.max():.2f}]")

    # 4. Adaptive regularization parameter
    # Adjust based on image size and content
    adaptive_lambda = config["regularization_lambda"] * \
        (1.0 + np.log(height * width) / 20.0)
    print(f"Using adaptive regularization: {adaptive_lambda:.2e}")

    # 5. Setup optimizer with improved settings
    callback = SFSCallback(config["max_iterations"])

    # Use bounds to prevent extreme height values
    height_bounds = [(-100.0, 100.0)] * (height * width)

    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=RuntimeWarning)

            result = minimize(
                fun=sfs_cost_and_gradient,
                x0=Z_initial.flatten(),
                args=(smoothed_image, light_vec, adaptive_lambda, image.shape),
                method='L-BFGS-B',
                bounds=height_bounds,
                jac=True,  # Our function returns both cost and gradient
                options={
                    'maxiter': config["max_iterations"],
                    'ftol': 1e-9,      # Tighter function tolerance
                    'gtol': 1e-6,      # Tighter gradient tolerance
                    'maxfun': config["max_iterations"] * 2,
                    'disp': False
                },
                callback=callback
            )
    except Exception as e:
        print(f"Optimization error: {e}")
        callback.close()
        return Z_initial
    finally:
        callback.close()

    print(f"\nOptimization completed:")
    print(f"  Success: {result.success}")
    print(f"  Iterations: {result.nit}")
    print(f"  Final cost: {result.fun:.6e}")

    if not result.success:
        print(f"  Warning: {result.message}")

    # 6. Post-process result
    final_dem = result.x.reshape(image.shape)

    # Apply light smoothing to final result
    final_dem = gaussian_filter(final_dem, sigma=0.3)

    print(
        f"Final DEM range: [{final_dem.min():.2f}, {final_dem.max():.2f}] units")

    return final_dem

    if not result.success:
        print(f"WARNING: Optimizer did not converge. Reason: {result.message}")

    # 4. Reshape final result to a 2D DEM
    final_dem = result.x.reshape(image.shape)

    return final_dem


def scale_dem_to_meters(dem: np.ndarray, shape: tuple, config: dict) -> np.ndarray:
    """Scales the relative DEM to physical units (meters)."""
    # Calculate pixel scale (meters per pixel)
    pixel_size_m = (config["detector_pixel_width_um"] * 1e-6) * \
                   (config["spacecraft_altitude_km"] * 1000) / \
                   (config["focal_length_mm"] * 1e-3)

    print(f"\nEstimated pixel scale: {pixel_size_m:.2f} m/pixel")

    # The output of SFS is Z/pixel_scale. To get Z, multiply by pixel_scale.
    scaled_dem = dem * pixel_size_m

    # Center the DEM around zero height
    scaled_dem -= np.mean(scaled_dem)

    return scaled_dem
