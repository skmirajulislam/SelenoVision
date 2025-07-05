import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from typing import Any
import os


def plot_depth_map(dem: np.ndarray, save_path: str, title: str = "Reconstructed DEM"):
    """Enhanced 2D depth map visualization with better colormap and statistics."""
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Main depth map
        im1 = ax1.imshow(dem, cmap='terrain', aspect='equal')
        ax1.set_title(
            f"{title}\nElevation Range: [{dem.min():.1f}, {dem.max():.1f}] meters")
        ax1.set_xlabel("X (pixels)")
        ax1.set_ylabel("Y (pixels)")

        # Add colorbar
        cbar1 = plt.colorbar(im1, ax=ax1, shrink=0.8)
        cbar1.set_label("Lunar Surface Height (meters)")

        # Histogram of heights
        ax2.hist(dem.flatten(), bins=50, alpha=0.7,
                 color='skyblue', edgecolor='black')
        ax2.set_title("Lunar Surface Height Distribution")
        ax2.set_xlabel("Surface Height (meters)")
        ax2.set_ylabel("Terrain Pixel Count")
        ax2.grid(True, alpha=0.3)

        # Add statistics text
        stats_text = f"Mean: {np.mean(dem):.2f} m\n"
        stats_text += f"Std: {np.std(dem):.2f} m\n"
        stats_text += f"Min: {np.min(dem):.2f} m\n"
        stats_text += f"Max: {np.max(dem):.2f} m"
        ax2.text(0.02, 0.98, stats_text, transform=ax2.transAxes,
                 verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()

        print(f"Saved depth map visualization: {save_path}")

    except Exception as e:
        print(f"Error creating depth map visualization: {e}")
        plt.close()


def plot_3d_surface(dem: np.ndarray, save_path: str, title: str = "Reconstructed 3D Surface"):
    """Enhanced 3D surface visualization with better performance and appearance."""
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        height, width = dem.shape

        # Adaptive downsampling for large DEMs
        max_points = 10000  # Limit for performance
        total_points = height * width

        if total_points > max_points:
            stride = int(np.sqrt(total_points / max_points)) + 1
            print(
                f"Downsampling 3D surface by factor {stride} for visualization")
        else:
            stride = 1

        # Create coordinate meshes with downsampling
        x_indices = np.arange(0, width, stride)
        y_indices = np.arange(0, height, stride)
        X, Y = np.meshgrid(x_indices, y_indices)
        Z = dem[::stride, ::stride]

        fig = plt.figure(figsize=(12, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Create surface plot - cast to Any to avoid type checker issues
        ax_3d: Any = ax
        surf = ax_3d.plot_surface(X, Y, Z, cmap='terrain', alpha=0.9,
                                  linewidth=0, antialiased=True, shade=True)

        ax_3d.set_title(title, fontsize=16, pad=20)
        ax_3d.set_xlabel("Longitudinal Distance (pixels)")
        ax_3d.set_ylabel("Latitudinal Distance (pixels)")
        ax_3d.set_zlabel("Lunar Surface Elevation (meters)")

        # Try to set better aspect ratio (may not work on all matplotlib versions)
        try:
            z_range = Z.max() - Z.min()
            ax_3d.set_box_aspect([width/stride, height/stride, z_range * 2])
        except:
            pass  # Ignore if not supported

        # Improve viewing angle
        ax_3d.view_init(elev=30, azim=45)

        # Add colorbar
        cbar = fig.colorbar(surf, shrink=0.6, aspect=10, pad=0.1)
        cbar.set_label("Height (meters)")

        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()

        print(f"Saved 3D surface visualization: {save_path}")

    except Exception as e:
        print(f"Error creating 3D surface visualization: {e}")
        plt.close()
