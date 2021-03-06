import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    primaryKey: '_id',
    attrs: {
        'tags': {
            serialize: 'ids',
            deserialize: 'records'
        }
    }
});
