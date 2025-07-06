// Test script to validate frontend API integration
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MTgzMDIxOSwianRpIjoiMDBjZGYyNjItOWZlOS00NmU0LTkxNjYtYTRmMzU1MzUyYTg1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjY4NmFiYzg4OWMyNDIwZmVhY2JkNDJjYSIsIm5iZiI6MTc1MTgzMDIxOSwiY3NyZiI6ImYyNjY1YTNiLWU5MWMtNDU5ZC1iMGU3LWYwMzU1YzM3ZjExYyJ9.gtwYmIoSB2r1P0IFyfmPJo37l-Fz9M10ImS31ldYGFE";

async function testFrontendAPI() {
    const API_BASE_URL = 'http://localhost:5002';

    try {
        console.log('Testing frontend API integration...');

        // Test getUserResults (should match our api.ts implementation)
        const response = await fetch(`${API_BASE_URL}/api/results/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Results fetched successfully:', data);
        console.log(`Found ${data.results.length} results`);

        // Test one completed result to see structure
        const completedResult = data.results.find(r => r.status === 'completed');
        if (completedResult) {
            console.log('✅ Completed result found:', {
                job_id: completedResult.job_id,
                filename: completedResult.filename,
                quality_score: completedResult.analysis_results?.quality_score,
                has_cloudinary_urls: !!completedResult.cloudinary_urls,
                image_urls: Object.keys(completedResult.cloudinary_urls || {}).filter(k => completedResult.cloudinary_urls[k])
            });
        }

        return true;
    } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
    }
}

// Call the test
testFrontendAPI();
