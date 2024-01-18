// Simulating changing the active link based on the router/page
    // In a real application, you would replace this with your actual logic
    const currentPage = 'Home'; // Change this based on your router or current page

    // Remove "active" class from all links
    document.querySelectorAll('#nav-container a').forEach(link => {
      link.classList.remove('active');
    });

    // Add "active" class to the current page link
    document.getElementById(`${currentPage}-link`).classList.add('active');