// parse commands YAML into a package JSON command structure
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import * as logSymbols from 'log-symbols';

interface CommandMenuInfo {
    menu: string;
    group?: string;
    when?: string | string[];
}

interface CommandInfo {
    title: string;
    /**
     * Optional UI category
     */
    category?: string;
    /**
     * A default group applied for all menu items that do not specify a group them selfs
     */
    group?: string;
    /**
     * When condition that is applied by default for all groups
     */
    when?: string | string[];
    /**
     * Icon in the form of an single icon or a dark and light them icon
     */
    icon?: string | { light?: string, dark?: string };
    /**
     * List of menus in which the command is available
     */
    menus?: CommandMenuInfo[];
}

interface CommandsYaml {
    [commandName: string]: CommandInfo
};

interface PackageContributions {
    commands: {
        command: string,
        title: string,
        category?: string,
        enablement?: string,
        icon?: string | { light?: string, dark?: string }
    }[];
    menus: {
        [name: string]: {
            command: string,
            group?: string,
            when?: string,
        }[]
    }
};

async function loadCommandsMeta(yamlFile: string): Promise<CommandsYaml> {
    return yaml.load((await fs.readFile(yamlFile)).toString());
}

function stripUndefined<T extends Object>(obj: T) : T { 
    for (const [name, value] of Object.entries(obj)) {
        if (value === undefined) {
            delete obj[name];
        }
    }
    return obj;
}

async function updatePackageJson(packageJsonFile: string, commandFile: string) {
    console.log(`Adding VSCode commands to package...`);

    const packageJson = await fs.readJSON(packageJsonFile);
    const commands = await loadCommandsMeta(commandFile);
    const contributes : PackageContributions = { commands: [], menus: {} };
    const activationEvents = new Set<string>(packageJson.activationEvents || []);

    for (const [name, command] of Object.entries(commands)) {
        // Add command base structure
        const newCommand : any = {
            command: name,
            title: command.title,
            groucategoryp: command.category
        };

        if (command.icon) {
            if (typeof command.icon === 'object') {
                newCommand.icon = command.icon;
            } else {
                newCommand.icon = {
                    light: command.icon.replace(/{(type|theme)}/ig, 'light'),
                    dark: command.icon.replace(/{(type|theme)}/ig, 'dark')
                };
            }
        }
                
        contributes.commands.push(stripUndefined(newCommand));
        activationEvents.add(`onCommand:${name}`);

        // Has menus?
        if (!command.menus) {
            command.menus = [];
        }

        // visible in command pallet?
        const inCommandPallet = command.menus.some(menu => menu.menu == 'commandPalette');
        if (!inCommandPallet) {
            command.menus.push({
                menu: 'commandPalette',
                when: 'false'
            });
        }

        // Build menus
        for (const menuInfo of command.menus || []) {
            const menu = contributes.menus[menuInfo.menu] || (contributes.menus[menuInfo.menu] = []);
            const newMenuEntry = stripUndefined({ 
                command: name,
                group: command.group || menuInfo.group
            });

            if (menuInfo.when) {
                if (Array.isArray(menuInfo.when)) {                    
                    menu.push(...menuInfo.when.map( when => ({ ...newMenuEntry, when: when.toString() }) ));
                } else {
                    menu.push({ ...newMenuEntry, when: menuInfo.when.toString() });
                }
            } else {
                menu.push(newMenuEntry);
            }
        }
    }

    // Update package JSON
    packageJson.activationEvents = [...activationEvents];
    packageJson.contributes = Object.assign({}, packageJson.contributes, contributes);
    await fs.writeJSON(packageJsonFile, packageJson, { spaces: 4 });
    console.log(`${chalk.bold(logSymbols.success)} Added ${chalk.bold(Object.entries(commands).length)} commands`);
}

async function updateCommandsYaml(packageJsonFile: string, commandFile: string) {
    const packageJson = await fs.readJSON(packageJsonFile);
    const contributes : PackageContributions = packageJson.contributes;
    const commands : CommandsYaml = {};

    const menuEntriesCount = Object.values(contributes.menus).reduce((s, e) => s + e.length, 0);

    console.log(`Read ${chalk.bold(`${contributes.commands.length} command`)} and ${chalk.bold(`${menuEntriesCount} menu`)} contributions`);

    for (const command of contributes.commands) {
        console.log(`Adding command ${chalk.green(command.command)}`);
        commands[command.command] = stripUndefined({
            title: command.title,
            category: command.category,
            icon: command.icon
        });
    }

    for (const [menu, entries] of Object.entries(contributes.menus)) {
        for (const entry of entries) {            
            console.log(`Adding command ${chalk.bold(entry.command)} to menu ${chalk.green(menu)}`);
            const commandMenus = commands[entry.command].menus || (commands[entry.command].menus = []);
            const existingEntry = commandMenus.find(e => e.menu == menu && e.group == entry.group && e.when !== undefined);

            if (existingEntry) {
                if (Array.isArray(existingEntry.when)) {
                    existingEntry.when.push(entry.when);
                }
            } else {
                commandMenus.push(stripUndefined({
                    menu: menu,
                    group: entry.group,
                    when: entry.when,
                }));
            }            
        }        
    }

    // Update Commands yaml
    console.log(`Updating ${chalk.green.bold(path.basename(commandFile))}`);
    await fs.writeFile(commandFile, yaml.dump(commands));
}

// Run update command
const [ packageJson, commandsYaml ] = process.argv.slice(2);
updatePackageJson(packageJson, commandsYaml);

// updateCommandsYaml(
//     path.resolve(__dirname, '../package.json'),
//     path.resolve(__dirname, '../commands2.yaml')
// );