"""
Results component for the SelenoVision Streamlit app
"""

import streamlit as st
import os
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import plotly.graph_objects as go
import plotly.express as px
import json
import time


def render_results():
    """Render the results component"""
    if "processing_results" in st.session_state and "processing_complete" in st.session_state:
        results = st.session_state.processing_results
        dem = st.session_state.dem
        image = st.session_state.original_image

        st.markdown("## Analysis Results")

        # Processing Information
        with st.expander("Processing Information", expanded=True):
            processing_info = results.get("processing_info", {})
            optimization = processing_info.get("optimization", {})

            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Processing Time", optimization.get(
                    "processing_time", "N/A"))

            with col2:
                st.metric("Iterations", optimization.get("iterations", "N/A"))

            with col3:
                st.metric("Converged", "Yes" if optimization.get(
                    "converged", False) else "No")

        # Visualizations Tab
        tab1, tab2, tab3 = st.tabs(
            ["Visualizations", "Analysis Metrics", "3D Model"])

        with tab1:
            # Display all visualizations
            if "visualizations" in results:
                vis_paths = results["visualizations"]

                # Comparison view
                if "comparison" in vis_paths and os.path.exists(vis_paths["comparison"]):
                    st.subheader("Image and DEM Comparison")
                    st.image(vis_paths["comparison"], use_container_width=True)
                    st.download_button(
                        label="Download Comparison",
                        data=open(vis_paths["comparison"], "rb").read(),
                        file_name="lunar_dem_comparison.png",
                        mime="image/png"
                    )

                # Relief shading
                if "relief" in vis_paths and os.path.exists(vis_paths["relief"]):
                    st.subheader("Shaded Relief")
                    st.image(vis_paths["relief"], use_container_width=True)
                    st.download_button(
                        label="Download Relief Map",
                        data=open(vis_paths["relief"], "rb").read(),
                        file_name="lunar_relief.png",
                        mime="image/png"
                    )

                # Contour map
                if "contour" in vis_paths and os.path.exists(vis_paths["contour"]):
                    st.subheader("Elevation Contour Map")
                    st.image(vis_paths["contour"], use_container_width=True)
                    st.download_button(
                        label="Download Contour Map",
                        data=open(vis_paths["contour"], "rb").read(),
                        file_name="lunar_contours.png",
                        mime="image/png"
                    )

            # Interactive Elevation Heatmap
            st.subheader("Interactive Elevation Heatmap")
            fig = px.imshow(dem,
                            labels=dict(x="X", y="Y", color="Elevation (m)"),
                            color_continuous_scale="viridis",  # Using a valid plotly colorscale
                            zmin=np.min(dem), zmax=np.max(dem))
            fig.update_layout(
                margin=dict(l=0, r=0, t=30, b=0),
                coloraxis_colorbar=dict(
                    title="Elevation (m)",
                    thicknessmode="pixels", thickness=20,
                    lenmode="fraction", len=0.75
                )
            )
            st.plotly_chart(fig, use_container_width=True)

        with tab2:
            # Analysis Results Tab
            if "analysis_results" in results:
                analysis = results["analysis_results"]

                # Quality Metrics
                st.subheader("Quality Metrics")
                quality_metrics = analysis.get("quality_metrics", {})

                # Create metric columns
                cols = st.columns(len(quality_metrics))
                for i, (metric, value) in enumerate(quality_metrics.items()):
                    with cols[i]:
                        st.metric(metric.replace(
                            '_', ' ').title(), f"{value:.2f}")

                # Surface Statistics
                st.subheader("Surface Statistics")
                surface_stats = analysis.get("surface_statistics", {})

                # Create table from surface statistics
                stats_data = {"Metric": [], "Value": []}
                for metric, value in surface_stats.items():
                    stats_data["Metric"].append(
                        metric.replace('_', ' ').title())
                    stats_data["Value"].append(f"{value:.2f}")

                st.dataframe(stats_data, use_container_width=True)

                # Terrain Assessment
                st.subheader("Terrain Assessment")
                terrain = analysis.get("terrain_assessment", {})

                # Create terrain metrics columns
                terrain_cols = st.columns(len(terrain))
                for i, (metric, value) in enumerate(terrain.items()):
                    with terrain_cols[i]:
                        st.metric(metric.replace(
                            '_', ' ').title(), f"{value:.2f}")

                # Analysis Visualizations
                if "analysis_visualizations" in results:
                    vis_paths = results["analysis_visualizations"]

                    # Slope Map
                    if "slope" in vis_paths and os.path.exists(vis_paths["slope"]):
                        st.subheader("Slope Map")
                        st.image(vis_paths["slope"], use_container_width=True)

                    # Aspect Map
                    if "aspect" in vis_paths and os.path.exists(vis_paths["aspect"]):
                        st.subheader("Aspect Map")
                        st.image(vis_paths["aspect"], use_container_width=True)

                    # Curvature Map
                    if "curvature" in vis_paths and os.path.exists(vis_paths["curvature"]):
                        st.subheader("Curvature Map")
                        st.image(vis_paths["curvature"],
                                 use_container_width=True)

                    # Elevation Histogram
                    if "histogram" in vis_paths and os.path.exists(vis_paths["histogram"]):
                        st.subheader("Elevation Distribution")
                        st.image(vis_paths["histogram"],
                                 use_container_width=True)

        with tab3:
            # 3D Model Tab
            st.subheader("Interactive 3D Surface Model")

            # Create downsampled mesh for 3D plotting (to improve performance)
            # Only use every Nth point
            downsample = 4  # Adjust based on DEM size

            # Get downsampled dimensions
            height, width = dem.shape
            ds_height = height // downsample
            ds_width = width // downsample

            # Create coordinate grids
            y, x = np.mgrid[0:height:downsample, 0:width:downsample]
            z = dem[::downsample, ::downsample]

            # Create interactive 3D surface with Plotly
            # Create surface plot with a valid colorscale
            fig = go.Figure()

            # Add the main surface with enhanced visualization
            fig.add_trace(go.Surface(
                z=z, x=x, y=y,
                colorscale='viridis',  # Using a valid plotly colorscale
                colorbar=dict(
                    title="Elevation (m)",
                    thickness=20,
                    len=0.75
                ),
                lighting=dict(
                    ambient=0.6,
                    diffuse=0.8,
                    specular=0.2,
                    roughness=0.5,
                    fresnel=0.8
                ),
                contours={
                    "z": {"show": True, "start": np.min(z), "end": np.max(z),
                          "size": (np.max(z)-np.min(z))/10, "color": "white", "width": 2}
                },
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=12,
                    font_family="Arial"
                ),
                hovertemplate="X: %{x}<br>Y: %{y}<br>Elevation: %{z:.2f} m<extra></extra>"
            ))

            # Update layout
            fig.update_layout(
                title="3D Lunar Surface Model",
                scene=dict(
                    xaxis_title="X",
                    yaxis_title="Y",
                    zaxis_title="Elevation (m)",
                    # Exaggerate elevation for better visualization
                    aspectratio=dict(x=1, y=1, z=0.5),
                    camera=dict(
                        # Optimize camera position
                        eye=dict(x=1.5, y=1.5, z=1.2)
                    )
                ),
                margin=dict(l=0, r=0, b=0, t=30)
            )

            st.plotly_chart(fig, use_container_width=True)

            # Download buttons for the 3D model
            st.subheader("Download 3D Model")

            # OBJ file
            if "obj_path" in results and os.path.exists(results["obj_path"]):
                st.download_button(
                    label="Download 3D Model (OBJ)",
                    data=open(results["obj_path"], "rb").read(),
                    file_name="lunar_surface.obj",
                    mime="application/octet-stream"
                )

            # GeoTIFF file
            if "geotiff_path" in results and os.path.exists(results["geotiff_path"]):
                st.download_button(
                    label="Download DEM (GeoTIFF)",
                    data=open(results["geotiff_path"], "rb").read(),
                    file_name="lunar_dem.tif",
                    mime="application/octet-stream"
                )

        # Reset button
        if st.button("Process Another Image"):
            # Clear session state
            for key in ["processing_results", "processing_complete", "uploaded_file",
                        "processing_config", "dem", "original_image"]:
                if key in st.session_state:
                    del st.session_state[key]

            # Rerun to reset the app
            st.rerun()
