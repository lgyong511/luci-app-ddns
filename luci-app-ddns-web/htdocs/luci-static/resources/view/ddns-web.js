'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require ui';
'require uci';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

var callServiceAction = rpc.declare({
	object: 'service',
	method: 'action',
	params: [ 'name', 'action' ],
	expect: { '': {} }
});

var actionLabels = {
	start: _('Start'),
	stop: _('Stop'),
	restart: _('Restart')
};

function serviceRunning(data) {
	var instances = data && data['ddns-web'] && data['ddns-web'].instances;
	return instances && Object.keys(instances).some(function(name) {
		return instances[name].running;
	});
}

return view.extend({
	load: function() {
		return Promise.all([ uci.load('ddns-web'), callServiceList('ddns-web') ]);
	},

	render: function(data) {
		var map = new form.Map('ddns-web', _('DDNS'),
			_('Control the DDNS service here. Providers, records, notifications, logs and Web accounts are configured in the DDNS Web console.'));
		var section = map.section(form.NamedSection, 'main', 'ddns-web', _('Service settings'));
		var enabled = section.option(form.Flag, 'enabled', _('Enable'));
		var statusText = E('span', { 'class': 'label' });
		var actionButtons = E('div', { 'class': 'cbi-value-field', 'style': 'display:flex;gap:.5em;flex-wrap:wrap' });
		var openButton = E('a', {
			'class': 'btn cbi-button cbi-button-action',
			'target': '_blank',
			'rel': 'noreferrer noopener',
			href: 'http://' + window.location.hostname + ':8686/'
		}, _('Open Web console'));

		enabled.default = '0';
		enabled.rmempty = false;
		var statusBox = E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Running status')),
			E('div', { 'style': 'display:flex;align-items:center;gap:1em;flex-wrap:wrap' }, [ statusText, openButton ]),
			E('p', { 'class': 'description' }, _('The DDNS console listens on port 8686. It accepts loopback and RFC1918 private IPv4 clients.')),
			E('div', { 'style': 'display:flex;align-items:center;gap:1em;flex-wrap:wrap' }, [
				E('strong', {}, _('Service actions')),
				actionButtons
			])
		]);

		function updateStatus(serviceData) {
			var running = !!serviceRunning(serviceData);
			statusText.className = running ? 'label success' : 'label warning';
			statusText.textContent = running ? _('DDNS is running') : _('DDNS is not running');
			openButton.style.display = running && window.location.hostname ? '' : 'none';
		}

		[ 'start', 'stop', 'restart' ].forEach(function(action) {
			var button = E('button', {
				'class': 'btn cbi-button',
				'type': 'button',
				'click': function() {
					button.disabled = true;
					return callServiceAction('ddns-web', action).then(function() {
						return callServiceList('ddns-web');
					}).then(updateStatus).finally(function() {
						button.disabled = false;
					}).catch(function(error) {
						ui.addNotification(null, E('p', {}, error.message || _('The service action failed.')), 'error');
					});
				}
			}, actionLabels[action]);
			actionButtons.appendChild(button);
		});

		updateStatus(data[1]);
		poll.add(function() { return callServiceList('ddns-web').then(updateStatus); });
		return map.render().then(function(renderedMap) { return E([], [ statusBox, renderedMap ]); });
	}
});
