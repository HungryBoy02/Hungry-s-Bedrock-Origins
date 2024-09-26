import { world, system, Player } from "@minecraft/server"
let actionbarPlayers = []
let actionBars = {}
system.afterEvents.scriptEventReceive.subscribe(e => {
    let id = e.id
    if (id == "actionbarapi:submit") {
        let message = e.message
        let plr = e.sourceEntity
        addActionbarText(plr, message)
    }
})

function addActionbarText(player: Player, text: string) {
    if (!actionbarPlayers.includes(player.name)) {
        actionbarPlayers.push(player.name)
        actionBars[player.name] = []
    }
    actionBars[player.name].push(text)
}

function submitActionbarText(player: Player, text: string) {
    player.runCommand("scriptevent actionbarapi:submit " + text)
}

// Try to only run once per addon, this adds up.
function initiate() {
    system.runInterval(() => {
        for (let playerName of actionbarPlayers) {
            let player = world.getPlayers({ name: playerName })[0]
            if (player) {
                player.onScreenDisplay.setActionBar(actionBars[playerName])
            }
        }
        actionbarPlayers = []
        actionBars = {}
    })

}

export { submitActionbarText, initiate }