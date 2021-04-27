export default class CityStore {
  constructor() {
    this.fixedCities = [];
    this.userCities = [];

    this.loadUserCities();
    this.loadFixedCities();
  }

  async loadFixedCities() {
    fetch('./cities.json', { cache: 'no-store' })
      .then(response => response.json())
      .then((data) => {
        this.fixedCities = data.cities;
      });
  }

  loadUserCities() {
    const userCities = JSON.parse(localStorage.getItem('futureMobility.cityStore.cities'));
    if (userCities) {
      this.userCities = userCities;
    }
  }

  saveLocal() {
    localStorage.setItem('futureMobility.cityStore.cities', JSON.stringify(this.userCities));
  }

  getAllCities() {
    const response = Object.assign(
      {},
      this.getAllUserCities(),
      this.getAllFixedCities(),
    );
    return response;
  }

  getAllFixedCities() {
    return Object.fromEntries(this.fixedCities.map((city, i) => [
      `F${i}`,
      city,
    ]));
  }

  getAllUserCities() {
    return Object.fromEntries(this.userCities.map((city, i) => [
      `L${i}`,
      city,
    ]).reverse());
  }

  get(id) {
    if (id[0] === 'F') {
      return this.fixedCities[id.substr(1)];
    }
    return this.userCities[id.substr(1)];
  }

  set(id, city) {
    const clone = (obj => JSON.parse(JSON.stringify(obj)));

    if (id === null || this.userCities[id.substr(1)] === undefined) {
      this.userCities.push(clone(city));
    } else {
      this.userCities[id.substr(1)] = clone(city);
    }
    this.saveLocal();
  }
}
