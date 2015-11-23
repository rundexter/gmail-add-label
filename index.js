var _ = require('lodash'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

var requireParams = ['id', 'userId'];
var pickReqAttr = [
    'id',
    'threadId',
    'labelIds',
    'snippet',
    'historyId',
    'internalDate',
    'payload',
    'body',
    'parts'
];

module.exports = {
    checkAuthOptions: function (step, dexter) {
        _.map(requireParams, function (reqParam) {
            if(!step.input(reqParam).first()) {

                this.fail('A ' + reqParam +' input variable is required for this module');
            }
        }, this);

        if(!dexter.environment('access_token')) {

            this.fail('A access_code environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        this.checkAuthOptions(step, dexter);

        var oauth2Client = new OAuth2();
        oauth2Client.setCredentials({access_token: dexter.environment('access_token'), refresh_token: dexter.environment('refresh_token')});

        console.log(step.input('addLabelIds').toArray());
        google.options({ auth: oauth2Client });
        google.gmail('v1').users.messages.modify({
            auth: oauth2Client,
            id: step.input('id', null).first(),
            userId: step.input('userId', null).first(),
            resource: {
                addLabelIds: step.input('addLabelIds').toArray(),
                removeLabelIds: step.input('removeLabelIds').toArray()
            }}, function (err, message) {

            err? this.fail(err) : this.complete(_.pick(message, pickReqAttr));
        }.bind(this));

    }
};
