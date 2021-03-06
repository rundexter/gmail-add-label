var _ = require('lodash'),
    util = require('./util.js'),
    google = require('googleapis'),
    service = google.gmail('v1');

var pickInputs = {
        'id': { key: 'id', type: 'array', validate: { req: true } },
        'userId': { key: 'userId', validate: { req: true } },
        'addLabelIds': { key: 'resource.addLabelIds', type: 'array' },
        'removeLabelIds': { key: 'resource.removeLabelIds', type: 'array' }
    },
    pickOutputs = {
        'id': 'id',
        'threadId': 'threadId',
        'labelIds': 'labelIds'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            credentials = dexter.provider('google').credentials();
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(credentials, 'access_token')
        });
        google.options({ auth: oauth2Client });
        inputs.id.forEach(function (mailId) {
            service.users.messages.modify(_.merge({id: mailId}, _.omit(inputs, 'id')), function (err, message) {
            err? this.fail(err) : this.complete(util.pickOutputs(message, pickOutputs));
        }.bind(this));
        });
    }
};
