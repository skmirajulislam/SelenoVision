import numpy as np


def get_light_vector(sun_azimuth_deg: float, sun_elevation_deg: float) -> np.ndarray:
    """
    Converts sun azimuth and elevation to a 3D unit light vector.
    Coordinate system: +X East, +Y North, +Z Up.
    Azimuth is clockwise from North.
    """
    az_rad = np.deg2rad(sun_azimuth_deg)
    el_rad = np.deg2rad(sun_elevation_deg)

    z = np.sin(el_rad)
    xy_proj = np.cos(el_rad)
    x = xy_proj * np.sin(az_rad)  # East
    y = xy_proj * np.cos(az_rad)  # North

    light_vec = np.array([x, y, z])
    return light_vec / np.linalg.norm(light_vec)


def calculate_surface_normals(Z: np.ndarray) -> np.ndarray:
    """
    Optimized surface normal calculation using vectorized operations.
    """
    # Calculate gradients using numpy's gradient function (more efficient)
    q, p = np.gradient(Z)

    # Create normal vectors efficiently using broadcasting
    # Normal vector is (-p, -q, 1), then normalized
    normals = np.stack([-p, -q, np.ones_like(Z)], axis=-1)

    # Calculate norms efficiently using numpy's vectorized operations
    norms = np.linalg.norm(normals, axis=2, keepdims=True)

    # Numerical stability: avoid division by zero
    safe_norms = np.maximum(norms, 1e-9)

    # Normalize using vectorized division
    normalized_normals = normals / safe_norms

    return normalized_normals


def calculate_predicted_image(Z: np.ndarray, light_vec: np.ndarray) -> np.ndarray:
    """
    Optimized predicted image calculation using vectorized operations.
    Uses Lambertian reflectance model: I = max(0, L · N)
    """
    normals = calculate_surface_normals(Z)

    # Vectorized dot product across all pixels
    # normals shape: (H, W, 3), light_vec shape: (3,)
    # Use einsum for efficient computation
    reflectance = np.einsum('ijk,k->ij', normals, light_vec)

    # Apply Lambertian model with clipping
    return np.maximum(0, reflectance)
