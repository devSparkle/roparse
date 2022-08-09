#! /usr/bin/env node
var shell = require("shelljs");
const commandLineArgs = require('command-line-args')
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

/* XML parser configuration */
const XMLoptions = {
	ignoreAttributes: false,
	format: true,
	indentBy: "	",
}

/* Parse the command */
const mainDefinitions = [
	{ name: "command", defaultOption: true },
	{ name: "help", alias: "d", type: Boolean },
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []

/* Process command */
if (mainOptions.command === undefined || mainOptions.help) {
	console.log("TODO: help command")
} else if (mainOptions.command === "pack") {
	var data = shell.cat("./test.rbxlx")
	
	if (XMLValidator.validate(data) == true) {
		const parser = new XMLParser(XMLoptions)
		const output = parser.parse(data);
		
		const builder = new XMLBuilder(XMLoptions)
		
		return console.log(output)
	}
} else {
	console.log(`'%s' is not a valid command.`, mainOptions.command)
}