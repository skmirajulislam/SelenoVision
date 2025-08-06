"""
Upload component for the SelenoVision Streamlit app
"""

import streamlit as st
import os
import time
from config import CONFIG, create_directories


def render_upload():
    """Render the image upload component"""
    st.markdown("## Upload Lunar Image")
    st.markdown("""
    Upload a lunar image to generate a 3D model of the lunar surface. 
    Supported formats: PNG, JPG, JPEG, TIFF
    """)

    # Create form for upload
    with st.form("upload_form"):
        uploaded_file = st.file_uploader("Choose a lunar image file",
                                         type=["png", "jpg",
                                               "jpeg", "tif", "tiff"],
                                         key="lunar_image")

        # Advanced settings expander
        with st.expander("Advanced Settings", expanded=False):
            col1, col2 = st.columns(2)

            with col1:
                sun_azimuth = st.slider("Sun Azimuth (°)",
                                        min_value=0.0,
                                        max_value=360.0,
                                        value=CONFIG["sun_azimuth_deg"],
                                        step=0.1,
                                        help="Sun azimuth angle in degrees (0° is North, 90° is East)")

                iterations = st.slider("Max Iterations",
                                       min_value=50,
                                       max_value=500,
                                       value=CONFIG["max_iterations"],
                                       step=10,
                                       help="Maximum number of iterations for the optimization algorithm")

                reg_lambda = st.slider("Regularization Lambda",
                                       min_value=0.01,
                                       max_value=0.2,
                                       value=CONFIG["regularization_lambda"],
                                       step=0.01,
                                       format="%.2f",
                                       help="Regularization strength for smoothness")

            with col2:
                sun_elevation = st.slider("Sun Elevation (°)",
                                          min_value=0.0,
                                          max_value=90.0,
                                          value=CONFIG["sun_elevation_deg"],
                                          step=0.1,
                                          help="Sun elevation angle in degrees (0° is horizon, 90° is zenith)")

                initial_surface = st.selectbox("Initial Surface",
                                               options=[
                                                   "flat", "random", "image"],
                                               index=0,
                                               help="Type of initial surface for the optimization")

                use_bilateral = st.checkbox("Use Bilateral Filter",
                                            value=CONFIG["use_bilateral_filter"],
                                            help="Apply bilateral filtering for edge-preserving smoothing")

        # Submit button
        submit_button = st.form_submit_button("Generate 3D Model")

    # Process the uploaded file when the form is submitted
    if submit_button and uploaded_file is not None:
        # Ensure directories exist
        create_directories()

        # Save the uploaded file temporarily
        from config import UPLOAD_DIR
        file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        # Update configuration based on form inputs
        config = CONFIG.copy()
        config["sun_azimuth_deg"] = sun_azimuth
        config["sun_elevation_deg"] = sun_elevation
        config["max_iterations"] = iterations
        config["regularization_lambda"] = reg_lambda
        config["initial_surface"] = initial_surface
        config["use_bilateral_filter"] = use_bilateral

        # Store the file path and config in session state for processing
        st.session_state.uploaded_file = file_path
        st.session_state.processing_config = config
        st.session_state.processing_start = True

        # Show a success message
        st.success(f"File uploaded successfully: {uploaded_file.name}")

    elif submit_button and uploaded_file is None:
        st.error("Please upload a lunar image file")

    # Display sample images
    st.markdown("### Don't have a lunar image?")
    if st.button("Use Sample Image"):
        # Use a sample image path
        from config import BASE_DIR
        sample_path = os.path.join(BASE_DIR, "assets", "sample_lunar.jpg")
        if os.path.exists(sample_path):
            # Store the file path in session state
            st.session_state.uploaded_file = sample_path
            st.session_state.processing_config = CONFIG.copy()
            st.session_state.processing_start = True
            st.info(f"Using sample image: {sample_path}")
        else:
            st.error("Sample image not found. Please upload your own image.")
