import { registerOrigin, registerOriginGamerule, getGameruleValue } from '../libs/horiginsapi.js'
import { system, world, EntityDamageCause } from '@minecraft/server'

const originId = 'horiginsenderian' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
const originTitle = "Enderian" // What your origin is called
const iconTexture = 'textures/items/ender_pearl' // The icon for your origin
const shortDescription = " The Enderian. You can teleport and are taller" // Your origin's short description
const longDescription = "The Enderian. You can teleport, and you are 1/2 block taller.\nWARNING: Being in rain or water damages you."
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    //{ id: 'health', value: '16' }, // Health up to 149, no decimals
    //{ id: 'exhaustion', value: 'nonefrommovement' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    //{ id: 'breathable', value: 'land' }, // Acceptable values are 'land' and 'underwater'
    //{ id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    //{ id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    { id: 'scale', value: '1.25' }//, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    //{ id: 'movement', value: '0.15' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

const abilities = [
    {
        abilityId: 'horigins.enderian.teleport',
        abilityName: 'Teleport', // Self explanitory
        abilityDescription: 'Throw an enderpearl [35s Cooldown]', // Self explanitory
        abilityIcon: 'textures/items/ender_pearl', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 35 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)
})

function addVector3(vector31, vector32) {
    return { x: vector31.x + vector32.x, y: vector31.y + vector32.y, z: vector31.z + vector32.z }
}

function multiplyVector(vector, multiplier) {
    return { x: vector.x * multiplier, y: vector.y * multiplier, z: vector.z * multiplier }
}

// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!
var damageInterval = 1 * 20
var currentInterval = 0
system.runInterval(() => {
    // First we get if anyone has activated their pounce ability
    currentInterval++;
    var teleporters = world.getPlayers({ tags: ['horigins.enderian.teleport'] })

    for (let i = 0; i < teleporters.length; i++) {
        var plr = teleporters[i]
        plr.removeTag("horigins.enderian.teleport")
        var epearl = plr.dimension.spawnEntity("snowball", addVector3(plr.getHeadLocation(), multiplyVector(plr.getViewDirection(), 1.5)))
        epearl.setDynamicProperty("horigins.teleportPlayer", plr.name)
        epearl.applyImpulse(addVector3(plr.getVelocity(), multiplyVector(plr.getViewDirection(), 2)))
    }
    if (currentInterval >= damageInterval) {
        currentInterval = 0
        var enderians = world.getPlayers({ tags: ['horigins.origin.horiginsenderian'] })
        if (world.getDynamicProperty("horigins.isRaining")) {
            for (let i = 0; i < enderians.length; i++) {
                if (enderians[i].dimension.id != "minecraft:overworld") continue;
                var block2 = enderians[i].dimension.getTopmostBlock({ x: enderians[i].location.x, z: enderians[i].location.z })
                if (block2 != undefined) {
                    if (block2.location.y < enderians[i].location.y) {
                        enderians[i].applyDamage(2, { cause: EntityDamageCause.drowning })
                    }
                } else {

                    enderians[i].applyDamage(2, { cause: EntityDamageCause.drowning })

                }
            }
        }
    }

    var enderians = world.getPlayers({ tags: ['horigins.origin.horiginsenderian'] })
    for (let i = 0; i < enderians.length; i++) {
        var plr = enderians[i]
        var block = plr.dimension.getBlock(plr.location)
        var block2 = plr.dimension.getBlock({ x: plr.location.x, y: plr.location.y + 1, z: plr.location.z })
        function processblock(blocka) {
            if (blocka.typeId == "minecraft:water") {
                plr.applyDamage(1, { cause: "drowning" })
            }
        }
        processblock(block)
        processblock(block2)
    }
})


/* this was moved to events, because it may be re used in other origins. here's how i got teleporting working tho :P
any entity with the horigins.teleportPlayer property will tp the player upon removal
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
    }
})
*/