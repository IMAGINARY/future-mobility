class ObjectStore {
  constructor(fixedObjectsPath = null) {
    this.fixedObjects = [];
    this.userObjects = [];

    this.loadUserObjects();
    if (fixedObjectsPath) {
      this.loadFixedObjects(fixedObjectsPath);
    }
  }

  async loadFixedObjects(path) {
    fetch(path, { cache: 'no-store' })
      .then(response => response.json())
      .then((data) => {
        this.fixedObjects = data.cities;
      });
  }

  loadUserObjects() {
    const userObjects = JSON.parse(localStorage.getItem('futureMobility.cityStore.cities'));
    if (userObjects) {
      this.userObjects = userObjects;
    }
  }

  saveLocal() {
    localStorage.setItem('futureMobility.cityStore.cities', JSON.stringify(this.userObjects));
  }

  getAllObjects() {
    return Object.assign(
      {},
      this.getAllUserObjects(),
      this.getAllFixedObjects(),
    );
  }

  getAllFixedObjects() {
    return Object.fromEntries(this.fixedObjects.map((obj, i) => [
      `F${i}`,
      obj,
    ]));
  }

  getAllUserObjects() {
    return Object.fromEntries(this.userObjects.map((obj, i) => [
      `L${i}`,
      obj,
    ]).reverse());
  }

  get(id) {
    if (id[0] === 'F') {
      return this.fixedObjects[id.substr(1)];
    }
    return this.userObjects[id.substr(1)];
  }

  set(id, obj) {
    if (id === null || this.userObjects[id.substr(1)] === undefined) {
      this.userObjects.push(obj);
    } else {
      this.userObjects[id.substr(1)] = obj;
    }
    this.saveLocal();
  }
}

module.exports = ObjectStore;
