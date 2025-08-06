"""
SelenoVision - Streamlit Application
Main entry point for the Streamlit app

This application provides a user-friendly interface for the Luna Photoclinometry
system, which generates Digital Elevation Models (DEMs) from lunar images using
Shape-from-Shading techniques. This implementation aligns perfectly with the backend
processor.py for consistent results.
"""

from components import (
    render_header,
    render_upload,
    render_processing,
    render_results,
    render_footer
)
from config import CONFIG, UPLOAD_DIR, RESULTS_DIR, OUTPUT_DIR, ANALYSIS_DIR
import streamlit as st
import os
import sys
import shutil
from pathlib import Path

# Add the current directory to the path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

# Import components and configuration

# Ensure directories exist


def create_directories():
    """Create required directories"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(ANALYSIS_DIR, exist_ok=True)


# Configure the page
st.set_page_config(
    page_title="Luna Photoclinometry",
    page_icon="🌙",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS
st.markdown("""
<style>
    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    .stProgress > div > div {
        background-image: linear-gradient(to right, #4F2D7F, #7B3FBF);
    }
    .stButton button {
        background-color: #4F2D7F;
        color: white;
    }
    .stButton button:hover {
        background-color: #7B3FBF;
        color: white;
    }
    h1, h2, h3 {
        color: #4F2D7F;
    }
</style>
""", unsafe_allow_html=True)

# Ensure directories exist
create_directories()


def main():
    """Main application function"""
    # Render the header
    render_header()

    # Render the appropriate view based on the session state
    if "processing_complete" in st.session_state and st.session_state.processing_complete:
        # Show results
        render_results()
    elif "processing_start" in st.session_state and st.session_state.processing_start:
        # Show processing
        render_processing()
    else:
        # Show upload form
        render_upload()

    # Render the footer
    render_footer()


if __name__ == "__main__":
    main()
