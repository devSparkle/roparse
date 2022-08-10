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
} else if (mainOptions.command === "unpack") {
	var xmlDataStr = shell.cat("./place.rbxlx")

	if (XMLValidator.validate(xmlDataStr) == true) {
		const parser = new XMLParser(XMLoptions)
		const output = parser.parse(xmlDataStr)

		unpack("roblox", output["roblox"])
	}
} else {
	console.log(`'%s' is not a valid command.`, mainOptions.command)
}

function unpack(path, content) {
	const builder = new XMLBuilder(XMLoptions)
	const ItemList = content["Item"]
	delete content["Item"]

	const name = content["@_class"] + content["@_referent"]
	const childPath = ((name) ? path + "/" + name : path)

	const metadata = builder.build(content)

	function unpackEach(item) {
		unpack(childPath, item)
	}

	if (ItemList) {
		shell.mkdir("-p", childPath)
		shell.ShellString(metadata).to(childPath + "/" + "metadata.xml")

		if (ItemList.forEach) {
			ItemList.forEach(unpackEach)
		} else unpackEach(ItemList)
	} else {
		shell.ShellString(metadata).to(childPath + ".xml")
	}
}