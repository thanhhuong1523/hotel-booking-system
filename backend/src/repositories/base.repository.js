class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, select = '') {
    return this.model.findById(id).select(select);
  }

  async findOne(query, select = '') {
    return this.model.findOne(query).select(select);
  }

  async find(query = {}, options = {}) {
    return this.model.find(query, null, options);
  }

  async update(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async countDocuments(query = {}) {
    return this.model.countDocuments(query);
  }

  async findByIdAndUpdate(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }
}

module.exports = BaseRepository;
