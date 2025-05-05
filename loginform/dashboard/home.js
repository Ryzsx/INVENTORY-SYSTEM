function showSection(id, el) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active-section');
    });
    document.getElementById(id).classList.add('active-section');

    document.querySelectorAll('.sidebar a').forEach(link => {
      link.classList.remove('active');
    });
    el.classList.add('active');
  }