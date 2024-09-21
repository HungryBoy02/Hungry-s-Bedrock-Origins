import { world, system, Player, ItemStack, EntityComponentTypes, EquipmentSlot } from '@minecraft/server';
import { MessageFormData, ModalFormData, ActionFormData } from '@minecraft/server-ui'
import { showBookUI, examplePages } from './libs/custom_books.js'

import { generateRTLProgressBar } from './libs/progressbars.js'

import { getRegisteredOrigins, clearOrigin, joinOrigin, getUserOrigin, getOriginGamerules } from './libs/horiginsapi.js'

import { CustomFormFormData, uiTypes } from './libs/custom_forms/custom_forms.js'

var bindingPlayers = []

if (world.getDynamicProperty("horigins.isRaining") == undefined) {
    world.setDynamicProperty("horigins.isRaining", false)
}

world.afterEvents.weatherChange.subscribe(data => {
    if (data.newWeather == "Rain" || data.newWeather == "Thunder") {
        world.setDynamicProperty("horigins.isRaining", true)
    } else {
        world.setDynamicProperty("horigins.isRaining", false)
    }
})


function showOriginConfig(user: Player) {
    var UI = new CustomFormFormData(uiTypes.originconfigmain)
        .title('§r§l§aOrigin Config')
        .button(10, "Abilities", ["View origin abilites and", "change emote binds"], 'textures/ui/originabilitiesbutton', 1)
    if (user.getDynamicProperty("horigins.toggleabilities") == undefined) {
        user.setDynamicProperty("horigins.toggleabilities", true)
    }
    if (user.getDynamicProperty("horigins.toggleabilities")) {
        UI.button(53, "Toggle Origin Abilites", ["Currently on"], 'textures/ui/on', 1)
    } else {
        UI.button(53, "Toggle Origin Abilites", ["Currently off"], 'textures/ui/off', 1)
    }


    if (user.hasTag("horigins.admin")) {
        UI.button(8, "Origin Gamerules", ["Toggle origin gamerules", "(eg: Creeper breaks blocks)"], 'textures/ui/icon_setting', 1)
    }
    UI.show(user).then((data) => {
        var ids = []
        function getSlotIdFromIterater(i: number) {
            var finalI = i
            finalI = ((finalI + 1) * 2) - 1
            var morethan4 = Math.ceil((i + 1) / 4)
            finalI = finalI + (morethan4 * 10) - 1
            ids.push({ i: i, moved: finalI })
            return finalI
        }

        function getIteraterFromSlotId(input: number) {
            for (let i = 0; i < ids.length; i++) {

                if (ids[i].moved == input) {
                    return ids[i].i;
                }
            }
        }

        if (data.canceled) return;
        if (data.selection == 10) {
            var abilitiesUI = new CustomFormFormData(uiTypes.originconfigabilities)
                .title("§r§c§lOrigin Abilities")
            var userOrigin = getUserOrigin(user)
            if (userOrigin == false) {
                abilitiesUI.body("You don't have an origin!")
            } else {
                abilitiesUI.button(53, "§r§c§lHow to use", ["If you're having trouble", "using or binding your", "ability, click here!"], 'textures/ui/help', 1)
                var originAbilities = userOrigin.originAbilities
                for (let i = 0; i < originAbilities.length; i++) {
                    abilitiesUI.button(getSlotIdFromIterater(i),
                        originAbilities[i].abilityName,
                        [originAbilities[i].abilityDescription, "Click to bind to an emote!"],
                        originAbilities[i].abilityIcon,
                        1)
                }



            }
            abilitiesUI.show(user).then((abiData) => {
                if (abiData.canceled) return;
                if (abiData.selection == 53) {
                    // Tutorial gui goes here
                    var abilityHelpUI = new CustomFormFormData(uiTypes.originabilityhelp)
                        .title("§a§lHow to bind & use abilities")
                        .body("After clicking an ability, open your emote wheel and use the emote you want to activate the ability. §oKeep in mind that the clapping emote will not work for this§r")
                        .show(user)
                } else {
                    var selectedAbility = originAbilities[getIteraterFromSlotId(abiData.selection)]
                    user.onScreenDisplay.setTitle(' ', {
                        stayDuration: 20 * 3,
                        fadeInDuration: 2,
                        fadeOutDuration: 4,
                        subtitle: 'Use an emote to bind your ability!',
                    });
                    bindingPlayers.push({ user: user, ability: selectedAbility })
                }
            })
        } else if (data.selection == 8) {
            if (user.hasTag("horigins.admin")) {
                // New gamerules ui goes here
                var gamerulesUi = new ModalFormData()
                    .title("Origin Gamerules")
                var gamerules = getOriginGamerules()
                for (let i = 0; i < gamerules.length; i++) {
                    if (typeof (gamerules[i].value) == "boolean") {
                        gamerulesUi.toggle(gamerules[i].title, gamerules[i].value)
                    }
                }
                gamerulesUi.submitButton("Submit Changes")
                gamerulesUi.show(user).then(formdata => {

                    for (let i = 0; i < formdata.formValues.length; i++) {
                        gamerules[i].value = formdata.formValues[i]
                    }
                    world.setDynamicProperty("horigins.gamerules", JSON.stringify(gamerules))
                })
            } else {
                user.sendMessage("You can't access that :/")
            }
        } else if (data.selection == 53) {
            user.setDynamicProperty("horigins.toggleabilities", !user.getDynamicProperty("horigins.toggleabilities"))
            showOriginConfig(user)
        }
    })
    return UI;
}



function showOriginChoiceMenuMain(user: Player, origins, page: number) {
    if (origins == null || origins == undefined) {
        origins = getRegisteredOrigins();
    }
    if (page == null || page == undefined) {
        page = 0
    }
    clearOrigin(user)
    var UI = new CustomFormFormData(uiTypes.chooseoriginsmain)
    UI.title("§r§l§cChoose an origin!")

    for (let i = page * 44; i < origins.length; i++) {
        if (i - (page * 44) >= 45) {
            break;
        }
        var buttonDesc = [origins[i].description, "§6Abilities:§r"]
        var orig = origins[i]
        for (let e = 0; e < orig.originAbilities.length; e++) {
            buttonDesc.push(orig.originAbilities[e].abilityName)
            buttonDesc.push(" " + orig.originAbilities[e].abilityDescription)
        }
        UI.button(i - page * 44, orig.originName, buttonDesc, origins[i].icon, 1)
    }

    var totalPages = Math.ceil(origins.length / 44)
    if (totalPages > 1) {
        if (page != 0) {
            UI.button(0 + 9 * 5, "Previous", [], 'textures/ui/ArrowLeft')
        }
        if (page < totalPages - 1) {
            UI.button(1 + 9 * 5, "Next", [], 'textures/ui/ArrowRight')
        }
    }

    UI.show(user).then(response => {
        if (response.canceled) {
            var inventory = user.getComponent("minecraft:inventory")
            var container = inventory.container
            if (container.emptySlotsCount > 0) {
                container.addItem(new ItemStack("horigins:origin_cookie", 1))
            }
            return;
        }
        if (response.selection == 0 + 9 * 5) {
            showOriginChoiceMenuMain(user, origins, page - 1)
        } else if (response.selection == 1 + 9 * 5) {
            showOriginChoiceMenuMain(user, origins, page + 1)
        } else {
            var selectedOrigin = origins[(page * 44) + response.selection]
            if ((selectedOrigin != null) && (selectedOrigin != undefined)) {
                //var responseUI = new MessageFormData()

                var desc = selectedOrigin.longDescription + "\n§6Abilities:§r"
                for (let e = 0; e < selectedOrigin.originAbilities.length; e++) {
                    desc = desc + "\n§e" + selectedOrigin.originAbilities[e].abilityName + "§r"
                    desc = desc + "\n " + selectedOrigin.originAbilities[e].abilityDescription + "§r"
                }

                var responseUI = new ActionFormData()
                    //.body(selectedOrigin.longDescription)
                    .title(selectedOrigin.originName)
                    //.button2("Choose " + selectedOrigin.originName)
                    //.button1("Go Back")
                    .body(desc)
                    .button("Choose " + selectedOrigin.originName)
                    .button("Go Back")
                    .show(user).then((menu2responsedata) => {
                        if (menu2responsedata.canceled || menu2responsedata.selection == 1) {
                            showOriginChoiceMenuMain(user, origins, page)
                        } else if (menu2responsedata.selection == 0/*menu2responsedata.formValues[0] == true/**/) {
                            joinOrigin(user, selectedOrigin.originId)
                            user.dimension.spawnParticle("horigins:swirl", user.location)
                        }
                    })
            }
        }
    })
    return UI;
}




function addCooldownTag(plr) {
    if (plr.hasTag("horigins.cooldown") != true) {
        plr.addTag("horigins.cooldown")
    }
}

function addCooldown(plr: Player, id: string, text: string, timeinseconds: number) {
    var cooldowns = plr.getDynamicProperty("horigins.cooldowns")
    //cooldowns = null
    if (cooldowns == null) {
        cooldowns = JSON.stringify([])
    }
    cooldowns = JSON.parse(cooldowns)
    cooldowns.push({ id: id, text: text, value: timeinseconds * 20, maxValue: timeinseconds * 20 })
    plr.setDynamicProperty("horigins.cooldowns", JSON.stringify(cooldowns))
}

function getAllCooldowns(plr: Player) {
    var cooldowns = plr.getDynamicProperty("horigins.cooldowns")
    if (cooldowns == null) {
        cooldowns = JSON.stringify([])
    }
    cooldowns = JSON.parse(cooldowns)
    return cooldowns;
}

function resetCooldowns(plr: Player) {
    plr.setDynamicProperty("horigins.cooldowns", JSON.stringify([]))
}

function processCooldowns(plr: Player) {
    var cooldowns = getAllCooldowns(plr)
    /*if (cooldowns[0] != null && cooldowns[0] != undefined) {
        world.sendMessage(JSON.stringify(cooldowns))
    }*/
    var idstoremove = []
    for (let i = 0; i < cooldowns.length; i++) {
        var currentCooldown = cooldowns[i]
        if (cooldowns[i].value < 1) {
            idstoremove.push(i)
        }
        cooldowns[i].value = cooldowns[i].value - 1
    }
    if (idstoremove.length > 0) {
        for (let i = 0; i < idstoremove.length; i++) {
            if (idstoremove[i] == 0) {
                cooldowns.shift()
            } else if (idstoremove[i] == idstoremove.length - 1) {
                cooldowns.pop()

            } else {
                cooldowns.splice(idstoremove[i], idstoremove[i])
            }

        }
    }

    plr.setDynamicProperty("horigins.cooldowns", JSON.stringify(cooldowns))
    var message = []
    for (let i = 0; i < cooldowns.length; i++) {
        var currentCooldown = cooldowns[i]
        var currentString = "§r" + currentCooldown.text + " §r" + generateRTLProgressBar(currentCooldown.value, currentCooldown.maxValue, 32, "|", "§r§a", "§r§2")
        if (i > 0) {
            currentString = "\n" + currentString
        }
        message.push(currentString)
    }
    if (cooldowns.length > 0) {
        plr.onScreenDisplay.setActionBar(message)
    } else {
        plr.removeTag('horigins.cooldowns')
    }

    return cooldowns;
}

function getIsCoolingDown(plr: Player, cooldownID: string) {
    var cooldowns = getAllCooldowns(plr)
    var final = false
    for (let i = 0; i < cooldowns.length; i++) {
        if (cooldowns[i].id == cooldownID) {
            final = true
            break
        }
    }
    return final;
}


var tpPlayers = []
world.beforeEvents.entityRemove.subscribe(data => {
    var tpPlayer = data.removedEntity.getDynamicProperty("horigins.teleportPlayer")
    if (tpPlayer != undefined) {
        var plr = world.getPlayers({ name: tpPlayer })[0]
        tpPlayers.push(plr)
        plr.setDynamicProperty("horigins.teleportLocation", data.removedEntity.location)
    }
})
world.afterEvents.entityRemove.subscribe(data => {
    for (let i = 0; i < tpPlayers.length; i++) {
        tpPlayers[i].teleport(tpPlayers[i].getDynamicProperty("horigins.teleportLocation"))
        tpPlayers[i].setDynamicProperty("horigins.teleportLocation")
    }
    tpPlayers = []
})


function toLookVector(vector2yawandpitch) {
    var pi = Math.PI;
    var yaw = (vector2yawandpitch.x) * (pi / 180)
    var pitch = (90 + vector2yawandpitch.y) * (pi / 180)
    var x = Math.cos(yaw) * Math.cos(pitch)
    var y = Math.sin(yaw) * Math.cos(pitch)
    var z = Math.sin(pitch)
    return { x: x, y: y, z: z };
}

try {
    world.scoreboard.addObjective('horigins.rollouttimer', 'dummy');
} catch (err) { }
var rollouttimer = world.scoreboard.getObjective('horigins.rollouttimer')

world.afterEvents.itemCompleteUse.subscribe((data) => {
    if (data.itemStack.typeId == "horigins:origin_cookie") {
        showOriginChoiceMenuMain(data.source, undefined, 0)
    }
})

world.afterEvents.playerSpawn.subscribe((data) => {
    var user = data.player
    if (user.hasTag("horigins.firstspawned") != true) {
        user.addTag("horigins.firstspawned")
        system.runTimeout(() => {
            var inventory = user.getComponent("minecraft:inventory")
            var container = inventory.container
            container.addItem(new ItemStack("horigins:originguide", 1))
            container.addItem(new ItemStack("horigins:origin_cookie", 1))
        }, 20)

    }
})

function getIsUserBinding(user: Player) {
    for (let i = 0; i < bindingPlayers.length; i++) {
        if (bindingPlayers[i].user == user) {
            return [true, i];
        }
    }
    return false;
}

function removePlayerFromBinding(user: Player) {
    for (let i = 0; i < bindingPlayers.length; i++) {
        if (bindingPlayers[i].user == user) {
            if (i == 0) {
                bindingPlayers.shift()
            } else if (i == bindingPlayers.length - 1) {
                bindingPlayers.pop()
            } else {
                bindingPlayers.splice(i, i)
            }
        }
    }
}

world.afterEvents.playerEmote.subscribe((data) => {
    var user = data.player
    rollouttimer.setScore(data.player, 0);


    if (data.personaPieceId.toString() == "36780a72-05aa-57b0-0520-4519ff8feb3d") {
        var isBinding = getIsUserBinding(data.player)
        if (isBinding[0]) {
            data.player.onScreenDisplay.setTitle(' ', {
                stayDuration: 20,
                fadeInDuration: 2,
                fadeOutDuration: 4,
                subtitle: 'You cannot bind to this emote.',
            });
            removePlayerFromBinding(user)
        }
        if (getIsCoolingDown(data.player, "rollout") == true && user.getDynamicProperty("horigins.toggleabilities") == true) {
            data.player.onScreenDisplay.setTitle(' ', {
                stayDuration: 20,
                fadeInDuration: 2,
                fadeOutDuration: 4,
                subtitle: 'Ability is cooling down!',
            });
        } else {
            rollouttimer.setScore(data.player, 145);
        }
    } else if (data.personaPieceId.toString() == "9a469a61-c83b-4ba9-b507-bdbe64430582") {
        var isBinding = getIsUserBinding(data.player)
        if (isBinding[0]) {
            data.player.onScreenDisplay.setTitle(' ', {
                stayDuration: 20,
                fadeInDuration: 2,
                fadeOutDuration: 4,
                subtitle: 'You cannot bind to this emote.',
            });
            removePlayerFromBinding(user)
        }
        showOriginConfig(data.player)
    } else {
        var isBinding = getIsUserBinding(data.player)
        if (isBinding[0]) {
            var bindings = user.getDynamicProperty("horigins.bindings")
            if (bindings == null || bindings == undefined) {
                bindings = {}
            } else {
                bindings = JSON.parse(bindings)
            }
            bindings[data.personaPieceId.toString()] = bindingPlayers[isBinding[1]]
            user.setDynamicProperty("horigins.bindings", JSON.stringify(bindings))
            removePlayerFromBinding(user)
            data.player.onScreenDisplay.setTitle(' ', {
                stayDuration: 20,
                fadeInDuration: 2,
                fadeOutDuration: 4,
                subtitle: 'Bound!',
            });
            user.dimension.spawnParticle("horigins:abilitybound", user.location)
            user.dimension.playSound("note.pling", user.location)
        } else if (user.getDynamicProperty("horigins.toggleabilities") == true) {
            var bindings = user.getDynamicProperty("horigins.bindings")

            if (bindings == null || bindings == undefined) {
                bindings = {}
            } else {
                bindings = JSON.parse(bindings)
                var abilityUsedTest = bindings[data.personaPieceId.toString()]
                if (abilityUsedTest != null && abilityUsedTest != undefined) {
                    var abilityUsed = abilityUsedTest.ability
                    if (getIsCoolingDown(data.player, abilityUsed.abilityId) == true) {
                        data.player.onScreenDisplay.setTitle(' ', {
                            stayDuration: 20,
                            fadeInDuration: 2,
                            fadeOutDuration: 4,
                            subtitle: 'Ability is cooling down!',
                        });
                    } else {
                        addCooldown(user, abilityUsed.abilityId, abilityUsed.abilityName + " Cooldown", abilityUsed.abilityCooldown)
                        user.addTag("horigins.cooldown")
                        user.addTag(abilityUsed.abilityId)
                    }
                }
            }

        }
        //data.player.applyKnockback(lv.x, lv.z, 10, 1 /*lv.y*/ * 1.5)
    }

})

world.afterEvents.itemUse.subscribe((data) => {
    if (data.itemStack != null) {
        if (data.itemStack.typeId == "horigins:originguide") {

            showBookUI(data.source, examplePages, 0)
        }
    }
})


system.runInterval(() => {
    var cooldownplayers = world.getPlayers({ tags: ['horigins.cooldown'] })

    for (let i = 0; i < cooldownplayers.length; i++) {
        var plr = cooldownplayers[i]
        processCooldowns(plr)
    }
    var resets = world.getPlayers({ tags: ['horigins.reset'] })

    for (let i = 0; i < resets.length; i++) {
        var plr = resets[i]
        resetCooldowns(plr)
    }

    // Silly rollout ability everyone gets
    var rolloutplayers = world.getPlayers({ scoreOptions: [{ minScore: 1, objective: 'horigins.rollouttimer' }] })
    for (let i = 0; i < rolloutplayers.length; i++) {
        var plr = rolloutplayers[i]//.foreach(plr => {
        rollouttimer.setScore(plr.scoreboardIdentity, rollouttimer.getScore(plr.scoreboardIdentity) - 1);
        var lv = toLookVector(plr.getRotation())
        plr.applyKnockback(lv.x, lv.z, 0.5, 0)
        if (rollouttimer.getScore(plr.scoreboardIdentity) < 1) {
            addCooldownTag(plr)
            addCooldown(plr, "rollout", "Roll Cooldown", 3)
        }
    }

    //})
})