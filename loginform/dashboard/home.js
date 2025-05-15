function showSection(sectionId, linkElement) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active-section'));

    // Remove 'active' class from all sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => link.classList.remove('active'));

    // Show the clicked section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active-section');
    } else {
        console.error(`Section with id '${sectionId}' not found.`);
    }

    // Add 'active' class to the clicked link
    linkElement.classList.add('active');
}

