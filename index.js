#! /usr/bin/env node
var shell = require("shelljs");
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
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
	console.log(commandLineUsage([
		{
			header: "Roblox File Parser",
			content: "A utility to parse Roblox files and make them git-friendly."
		},
		{
			header: "Options",
			optionList: [
				{
					name: "help",
					alias: "h",
					description: "Displays a help page about the current command"
				}
			]
		},
		{
			header: "Commands",
			content: [
				{ name: 'unpack', summary: 'Unpacks a .rbxlx file' },
			]
		}
	]))
} else if (mainOptions.command === "unpack") {
	var xmlDataStr = shell.cat("./place.rbxlx")

	if (XMLValidator.validate(xmlDataStr) == true) {
		const parser = new XMLParser(XMLoptions)
		const output = parser.parse(xmlDataStr)

		unpack("roblox", output["roblox"])
	}
} else if (mainOptions.command === "pack") {
	console.log("TODO: pack command")
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