import { registerOrigin, registerOriginGamerule, getGameruleValue } from '../libs/horiginsapi.js'
import { system, world } from '@minecraft/server'

const originId = 'horiginscreeper' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
//                                     (so this one's tag would actually be "horigins.origin.horiginsfox")
const originTitle = "Creeper" // What your origin is called
const iconTexture = 'textures/ui/origins/creeper' // The icon for your origin
const shortDescription = " The creeper origin. You can explode." // Your origin's short description
const longDescription = "Creeper, you can explode at will"
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    //{ id: 'health', value: '16' }, // Health up to 149, no decimals
    //{ id: 'exhaustion', value: 'nonefrommovement' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    //{ id: 'breathable', value: 'land' }, // Acceptable values are 'land' and 'underwater'
    //{ id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    //{ id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    //{ id: 'scale', value: '0.75' }, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    //{ id: 'movement', value: '0.15' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

const abilities = [
    {
        abilityId: 'horigins.creeper.explode',
        abilityName: 'Explode', // Self explanitory
        abilityDescription: 'Explode in a 5 block radius\n  §7- Kills you\n  §7- Destroys non explosion proof items', // Self explanitory
        abilityIcon: 'textures/items/gunpowder', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 0 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)
    registerOriginGamerule("creeper.doesExplosionDamage", false, "Creeper Origin breaks blocks")
    // Registers a gamerule in case you want to let server admins choose if their origin does something or not.
    // As of writing this script (9/5/2024) I have only implemented toggles to this.
    // Please do not use things other than booleans (that's true or false, for those who are making their first project)
})


// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!

system.runInterval(() => {
    // First we get if anyone has activated their pounce ability
    var exploders = world.getPlayers({ tags: ['horigins.creeper.explode'] })

    for (let i = 0; i < exploders.length; i++) {
        var plr = exploders[i]

        plr.removeTag("horigins.creeper.explode")
        var dimension = plr.dimension
        var location = plr.location
        plr.applyDamage(20, { cause: "entityExplosion", damagingEntity: plr }) // Make sure the player dies from the explosion
        // Applied before the actual explosion so that the player doesn't absorb all the damage before the other players can take damage
        dimension.createExplosion(location, 5, { breaksBlocks: getGameruleValue("creeper.doesExplosionDamage"), source: plr })
    }
})

