'use strict';
'require view';
'require form';
'require poll';
'require rpc';
'require uci';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

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
		var port = section.option(form.Value, 'port', _('Web port'));
		var statusText = E('span', { 'class': 'label' });
		var errorText = E('p', { 'class': 'alert-message error', 'style': 'display:none' },
			_('DDNS failed to start. The configured Web port may already be in use.'));
		var openButton = E('a', {
			'class': 'btn cbi-button cbi-button-action',
			'target': '_blank',
			'rel': 'noreferrer noopener',
			href: '#'
		}, _('Open Web console'));

		enabled.default = '0';
		enabled.rmempty = false;
		port.datatype = 'port';
		port.default = '8686';
		port.placeholder = '8686';
		port.rmempty = true;
		var statusBox = E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Running status')),
			E('div', { 'style': 'display:flex;align-items:center;gap:1em;flex-wrap:wrap' }, [ statusText, openButton ]),
			errorText,
			E('p', { 'class': 'description' }, _('The DDNS console listens on the configured port. It accepts loopback and RFC1918 private IPv4 clients.'))
		]);

		function configuredPort() {
			var value = uci.get('ddns-web', 'main', 'port') || '8686';
			return /^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(value) ? value : '8686';
		}

		function updateStatus(serviceData) {
			var running = !!serviceRunning(serviceData);
			var servicePort = configuredPort();
			statusText.className = running ? 'label success' : 'label warning';
			statusText.textContent = running ? _('DDNS is running') : _('DDNS is not running');
			errorText.style.display = !running && uci.get('ddns-web', 'main', 'enabled') === '1' ? '' : 'none';
			openButton.href = 'http://' + window.location.hostname + ':' + servicePort + '/';
			openButton.style.display = running && window.location.hostname ? '' : 'none';
		}

		updateStatus(data[1]);
		poll.add(function() { return callServiceList('ddns-web').then(updateStatus); });
		return map.render().then(function(renderedMap) { return E([], [ statusBox, renderedMap ]); });
	}
});
