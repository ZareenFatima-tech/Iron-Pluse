import utils from './utils.js';

const gyms = {
  renderGymList: (gymList, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (gymList.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-muted">No gyms found matching your criteria.</h5></div>';
      return;
    }

    container.innerHTML = gymList.map(gym => {
      const isOpen = utils.isGymOpen(gym.openingTime || '06:00', gym.closingTime || '22:00');
      return `
        <div class="col-md-4 mb-4 animate-fade">
          <div class="glass-card h-100">
            <img src="${gym.image}" class="card-img-top gym-image" alt="${gym.name}" onerror="this.src='https://via.placeholder.com/400x250?text=Gym+Image'">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title text-white mb-0">${gym.name}</h5>
                <span class="status-badge ${isOpen ? 'status-open' : 'status-closed'}">
                  ${isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p class="text-muted small mb-2"><i class="bi bi-geo-alt"></i> ${gym.location}</p>
              <div class="mb-3">
                ${(gym.facilities || []).map(s => `<span class="badge bg-secondary me-1" style="font-size: 0.7rem;">${s}</span>`).join('')}
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-primary fw-bold">${utils.formatCurrency(gym.price)} / mo</span>
                <button class="btn btn-sm btn-primary-custom" onclick="window.viewGymDetails('${gym.id}')">View Details</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  filterGyms: (allGyms, filters) => {
    return allGyms.filter(gym => {
      const matchName = !filters.name || gym.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchCity = !filters.city || (gym.location && gym.location.includes(filters.city));
      const matchSpec = !filters.specialization || (gym.facilities && gym.facilities.includes(filters.specialization));
      return matchName && matchCity && matchSpec;
    });
  }
};

export default gyms;
