import { registerOrigin } from '../libs/horiginsapi.js'
import { system, world, Player } from '@minecraft/server'

const originId = 'horiginsfox' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
//                                     (so this one's tag would actually be "horigins.origin.horiginsfox")
const originTitle = "Fox" // What your origin is called
const iconTexture = 'textures/ui/origins/foxicon' // The icon for your origin
const shortDescription = " Fox origin" // Your origin's short description
const longDescription = "Fox origin\n§cPassive Abilities:\n§r - Fall Immunity\n\nDietary Changes:\n - Berries will fill your hunger bar, and will give you positive effects"
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    { id: 'health', value: '16' }, // Health up to 149, no decimals
    { id: 'exhaustion', value: 'nonefrommovement' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    { id: 'breathable', value: 'land' }, // Acceptable values are 'land' and 'underwater'
    { id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    { id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    { id: 'scale', value: '0.75' }, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    { id: 'movement', value: '0.15' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]


// THIS IS NOT IMPLEMENTED YET, IGNORE IT.
/*const damageTypeImmunities = [
    "horigins.sweetbushimmunity",
    "horigins.fallimmunity"  // these are added as tags to your origin, currently available immunities are:
    // 'horigins.fallimmunity', 'horigins.fallingblockimmunity', and "horigins.sweetbushimmunity". More to come.
]*/

const abilities = [
    // If you are having trouble figuring out how origin abilities work, here's the perfect time to find out how to set it up!
    {
        abilityId: 'horigins.fox.pounce',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Pounce', // Self explanitory
        abilityDescription: 'Lets you do a cool pounce!', // Self explanitory
        abilityIcon: 'textures/items/feather', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 5 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    },
    {
        abilityId: 'horigins.fox.sneak',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Sneak', // Self explanitory
        abilityDescription: 'Turn invisible for 10 seconds', // Self explanitory
        abilityIcon: 'textures/ui/invisibility_effect', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 20 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)
})

let goodFoods = ["minecraft:glow_berries", "minecraft:sweet_berries"]
let badFoods = []
world.afterEvents.itemCompleteUse.subscribe(e => {
    if (e.source.hasTag("horigins.origin.horiginsfox")) {
        if (badFoods.includes(e.itemStack.typeId)) {
            e.source.addEffect("hunger", 20 * 30, { amplifier: 9 })
            e.source.addEffect("poison", 20 * 30, { amplifier: 0 })
        } else if (goodFoods.includes(e.itemStack.typeId)) {
            e.source.addEffect("regeneration", 20 * 5, { amplifier: 1 })
            e.source.addEffect("speed", 20 * 30, { amplifier: 1 })
            e.source.addEffect("saturation", 20, { amplifier: 10 })
        }
    }
})
/* for feline origin later
let singleUseItems = ["minecraft:sugar"]
world.afterEvents.itemUse.subscribe(e => {
    let plr = e.source
    if (plr.hasTag("horigins.origin.horiginsfox")) {
        let invcomp = plr.getComponent("minecraft:inventory")
        let item = invcomp.container.getSlot(plr.selectedSlotIndex).getItem()
        if (singleUseItems.includes(item.typeId)) {
            if (item.amount == 1) {
                item = null
            } else {
                item.amount--;
            }
            invcomp.container.getSlot(plr.selectedSlotIndex).setItem(item)

            // Your code here
        }
    }
})*/

// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!


// used for pounce
function toLookVector(vector2yawandpitch) {
    var pi = Math.PI;
    var yaw = (vector2yawandpitch.x) * (pi / 180)
    var pitch = (90 + vector2yawandpitch.y) * (pi / 180)
    var x = Math.cos(yaw) * Math.cos(pitch)
    var y = Math.sin(yaw) * Math.cos(pitch)
    var z = Math.sin(pitch)
    return { x: x, y: y, z: z };
}

function negateFall(plr: Player) {
    let dimension = plr.dimension
    if (!plr.isOnGround) {
        let distance = -plr.getVelocity().y * 10
        let result = dimension.getBlockFromRay(plr.location, { x: 0, y: -1, z: 0 }, { maxDistance: distance })
        if (result) {
            if (result.block) {
                let block = result.block
                plr.addEffect("slow_falling", 2, { amplifier: 0, showParticles: false })
            }
        }
    }

}
// Check if someone is pouncing every tick
system.runInterval(() => {
    // First we get if anyone has activated their pounce ability
    var foxJumpers = world.getPlayers({ tags: ['horigins.fox.pounce'] })

    for (let i = 0; i < foxJumpers.length; i++) {
        var plr = foxJumpers[i]

        // If theyre pouncing, we dont want them to activate it more than once, so we delete the tag
        plr.removeTag("horigins.fox.pounce")

        // then we pounce!
        var lv = toLookVector(plr.getRotation())
        plr.applyKnockback(lv.x, lv.z, 10, 1 * 1.5)
    }

    var foxSneakers = world.getPlayers({ tags: ['horigins.fox.sneak'] })
    for (let i = 0; i < foxSneakers.length; i++) {
        var plr = foxSneakers[i]

        plr.removeTag("horigins.fox.sneak")

        plr.addEffect("invisibility", 10 * 20, { amplifier: 0, showParticles: false })
    }
    let plrs = world.getPlayers({ tags: ["horigins.origin.horiginsfox"] })
    for (let i = 0; i < plrs.length; i++) {
        plr = plrs[i]
        negateFall(plr)
    }

})

