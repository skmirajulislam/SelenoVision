"""
Header component for the SelenoVision Streamlit app
"""

import streamlit as st


def render_header():
    """Render the application header"""
    # Create a professional-looking header with gradient background
    st.markdown("""
    <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; border-radius: 10px;">
        <div style="display: flex; align-items: center;">
            <img src="https://cdn.imgbin.com/11/24/20/imgbin-moon-crescent-icon-moon-yellow-moon-illustration-YU4sRRb77GXTYsLVatrC41gMA.jpg" width="80" style="margin-right: 20px;"/>
            <div>
                <h1 style="color: white; margin: 0;">ISRO BAH13 Luna Photoclinometry</h1>
                <p style="color: #e0e0e0; margin: 0; font-size: 1.1rem;">Advanced Shape-from-Shading for Lunar Surface Reconstruction</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    st.markdown("""
    This application implements a comprehensive photoclinometry system for reconstructing 3D lunar surface 
    topography from single images. The system uses advanced Shape-from-Shading algorithms with optimized 
    numerical methods to generate high-quality Digital Elevation Models (DEMs) from lunar imagery.
    """)
