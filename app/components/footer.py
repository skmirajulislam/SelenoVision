"""
Footer component for the SelenoVision Streamlit app
"""

import streamlit as st


def render_footer():
    """Render the application footer"""
    st.divider()

    col1, col2 = st.columns([3, 1])

    with col1:
        st.markdown("""
        <div style="font-size: 0.8em; color: #888;">
        ISRO BAH13 Luna Photoclinometry - Advanced Shape-from-Shading for Lunar Surface Reconstruction<br>
        <b>Streamlit Version:</b> Local-only implementation with no database or cloud dependencies
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div style="font-size: 0.8em; color: #888; text-align: right;">
        Version 1.0.0<br>
        © 2025
        </div>
        """, unsafe_allow_html=True)
