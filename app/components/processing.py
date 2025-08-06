"""
Processing component for the SelenoVision Streamlit app
Implements the exact processing flow as backend processor.py
"""

import streamlit as st
import time
import os
from utils.processing import (
    process_lunar_image,
    load_and_validate_image,
    optimize_surface_sfs,
    scale_dem_to_physical,
    create_geotiff,
    create_obj_file,
    create_visualizations,
    analyze_dem_quality,
    compute_illumination_vector
)
import numpy as np
import matplotlib.pyplot as plt


def render_processing():
    """Render the processing component with detailed progress tracking"""
    if "processing_start" in st.session_state and st.session_state.processing_start:
        st.markdown("## Processing Lunar Image")

        # Get file path and config from session state
        file_path = st.session_state.uploaded_file
        config = st.session_state.processing_config

        # Display uploaded image
        if os.path.exists(file_path):
            st.image(file_path, caption="Uploaded Image",
                     use_container_width=True)
        else:
            st.error(f"Error: File not found at path {file_path}")
            return

        # Progress bar for processing
        progress_bar = st.progress(0)
        status_text = st.empty()

        # Create columns for progress display
        col1, col2 = st.columns(2)
        preview_container = col1.empty()
        metrics_container = col2.empty()

        # Process the image with detailed progress
        try:
            # Update status - Initial setup
            status_text.text("Loading and validating image...")
            progress_bar.progress(5)

            # Callback for updating optimization progress
            def update_progress(current_iter, max_iter, error):
                progress = min(10 + (current_iter / max_iter * 70), 80)
                progress_bar.progress(int(progress))
                status_text.text(
                    f"Optimizing lunar surface: {current_iter}/{max_iter} iterations - Error: {error:.8f}")

                # Only update metrics occasionally to avoid slowing down
                if current_iter % 10 == 0 or current_iter == max_iter:
                    metrics_container.metric(
                        "Iterations", f"{current_iter}/{max_iter}", delta=f"{int(current_iter/max_iter*100)}%")
                    metrics_container.metric("Error", f"{error:.8f}")

                # Don't slow down processing too much
                time.sleep(0.01)
            time.sleep(0.3)

            # Update status
            status_text.text("Computing illumination vector...")
            progress_bar.progress(15)
            time.sleep(0.3)

            # Update status
            status_text.text("Initializing surface...")
            progress_bar.progress(20)
            time.sleep(0.3)

            # Update status
            status_text.text("Preparing optimization algorithm...")
            progress_bar.progress(25)
            time.sleep(0.3)

            # Update status - longer process
            status_text.text(
                "Running Shape-from-Shading optimization (this may take a while)...")
            progress_bar.progress(30)

            # Create a progress placeholder for optimization
            optimization_progress = st.empty()

            # Define a custom callback function to update progress during processing
            def progress_callback(iteration, total, error):
                progress = min(70, 30 + (iteration / total) * 40)
                status = f"Iteration {iteration}/{total}: Error={error:.6f}"
                progress_bar.progress(int(progress))
                optimization_progress.text(status)

            # Perform actual processing with callback
            results, dem, image = process_lunar_image(
                file_path, "results", config, progress_callback=progress_callback)

            # Update status
            status_text.text("Creating visualizations...")
            progress_bar.progress(80)
            time.sleep(0.5)

            # Update status
            status_text.text("Analyzing results...")
            progress_bar.progress(90)
            time.sleep(0.5)

            # Finalize processing
            progress_bar.progress(100)
            status_text.text("Processing complete!")

            # Store results in session state
            st.session_state.processing_results = results
            st.session_state.dem = dem
            st.session_state.original_image = image
            st.session_state.processing_complete = True
            st.session_state.processing_start = False

            # Rerun to move to the results display
            st.rerun()

        except Exception as e:
            # Handle errors
            progress_bar.empty()
            status_text.empty()
            st.error(f"Error processing image: {str(e)}")
            st.session_state.processing_start = False
