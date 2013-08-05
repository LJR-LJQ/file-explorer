var parseKetchup = require('parseKetchup').parseKetchup,
	toHtml5Text = require('toHtml5Text').toHtml5Text;

var fs = require('fs');

var input = fs.readFileSync('input.txt', {encoding: 'utf8'}),
	output;

output = toHtml5Text(parseKetchup(input));
fs.writeFileSync('output.txt', output, {encoding: 'utf8'});