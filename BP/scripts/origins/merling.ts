import { registerOrigin, registerOriginGamerule, getGameruleValue } from '../libs/horiginsapi.js'
import { system, world } from '@minecraft/server'

const originId = 'horiginsmerling' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
const originTitle = "Merling" // What your origin is called
const iconTexture = 'textures/items/bucket_cod' // The icon for your origin
const shortDescription = " Merling, you can breathe underwater" + // Your origin's short description
    "\n  but not on land."
const longDescription = "You gain the ability to breathe underwater, but not on land.\n" +
    " + If it is raining, you are able to breathe\n"
    + "Permanant conduit power while in water\n"
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    //{ id: 'health', value: '16' }, // Health up to 149, no decimals
    //{ id: 'exhaustion', value: 'nonefrommovement' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    { id: 'breathable', value: 'underwater' }//, // Acceptable values are 'land' and 'underwater'
    //{ id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    //{ id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    //{ id: 'scale', value: '0.75' }, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    //{ id: 'movement', value: '0.15' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

const abilities = [
    // If you are having trouble figuring out how origin abilities work, here's the perfect time to find out how to set it up!
    {
        abilityId: 'horigins.merling.speedboost',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Speed Boost', // Self explanitory
        abilityDescription: 'Gives you a 7.5 second speed boost, can be used anywhere', // Self explanitory
        abilityIcon: 'textures/ui/speed_effect', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 10 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]


world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)

})


// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!



system.runInterval(() => {

    var merlings = world.getPlayers({ tags: ['horigins.origin.horiginsmerling'] })

    for (let i = 0; i < merlings.length; i++) {
        var plr = merlings[i]
        var block = plr.dimension.getBlock(plr.location)
        if (block != undefined) {
            if (block.isLiquid) {
                plr.addEffect("conduit_power", 20 * 20, { showParticles: false })
            } else {
                plr.removeEffect("conduit_power")
                if (world.getDynamicProperty("horigins.isRaining") && plr.dimension.id == "minecraft:overworld") {
                    var block2 = plr.dimension.getTopmostBlock({ x: plr.location.x, z: plr.location.z })
                    if (block2 != undefined) {
                        if (block2.location.y < plr.location.y) {
                            plr.addEffect("water_breathing", 5 * 20, { showParticles: false })
                        }
                    } else {
                        plr.addEffect("water_breathing", 5 * 20, { showParticles: false })
                    }
                }
            }
        }
    }

    var boosters = world.getPlayers({ tags: ['horigins.merling.speedboost'] })

    for (let i = 0; i < boosters.length; i++) {
        var plr = boosters[i]
        plr.removeTag("horigins.merling.speedboost")
        plr.addEffect("speed", Math.floor(7.5 * 20), { showParticles: false })
    }

})

/*
To get if it's raining, i made a dynamic property and updated it using the event.

world.afterEvents.weatherChange.subscribe(data => {
    if (data.newWeather == "Rain" || data.newWeather == "Thunder") {
        world.setDynamicProperty("horigins.isRaining", true)
    } else {
        world.setDynamicProperty("horigins.isRaining", false)
    }
})

If you want to use it in your origin, but don't have access to my dynamicproperties
*/