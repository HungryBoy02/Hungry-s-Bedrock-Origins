import { registerOrigin } from '../libs/horiginsapi.js'
import { system, world } from '@minecraft/server'

const originId = 'horiginsraccoon' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin

const originTitle = "Raccoon" // What your origin is called
const iconTexture = 'textures/ui/origins/racc' // The icon for your origin
const shortDescription = " Raccoon Origin" // Your origin's short description
const longDescription = "Raccoon Origin\n§cPassive Abilities:\n§rFall Immunity"
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

const abilities = [
    // If you are having trouble figuring out how origin abilities work, here's the perfect time to find out how to set it up!
    {
        abilityId: 'horigins.raccoon.dumpsterjump',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Dumpster Dive', // Self explanitory
        abilityDescription: "Jump into a dumpster, even if it's 19 blocks high!", // Self explanitory
        abilityIcon: 'textures/ui/origins/abilities/dumpster', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 8 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    },
    {
        abilityId: 'horigins.raccoon.sneak',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Sneak', // Self explanitory
        abilityDescription: 'Turn invisible for 10 seconds', // Self explanitory
        abilityIcon: 'textures/ui/invisibility_effect', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 20 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    },
    {
        abilityId: 'horigins.raccoon.lemmein',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Lemme In', // Self explanitory
        abilityDescription: 'Raccoons can get into just about anything. This ability teleports you 2 blocks forward', // Self explanitory
        abilityIcon: 'textures/ui/mining_fatigue_effect', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 30 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)
})


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
    var foxJumpers = world.getPlayers({ tags: ['horigins.raccoon.dumpsterjump'] })

    for (let i = 0; i < foxJumpers.length; i++) {
        var plr = foxJumpers[i]

        // If theyre pouncing, we dont want them to activate it more than once, so we delete the tag
        plr.removeTag("horigins.raccoon.dumpsterjump")

        // then we pounce!
        var lv = toLookVector(plr.getRotation())
        plr.applyKnockback(lv.x, lv.z, 3, 1 * 2)
    }

    var raccoonSneakers = world.getPlayers({ tags: ['horigins.raccoon.sneak'] })

    for (let i = 0; i < raccoonSneakers.length; i++) {
        var plr = raccoonSneakers[i]

        plr.removeTag("horigins.raccoon.sneak")

        plr.addEffect("invisibility", 10 * 20, { amplifier: 0, showParticles: false })
    }

    let plrs = world.getPlayers({ tags: ["horigins.origin.horiginsraccoon"] })
    for (let i = 0; i < plrs.length; i++) {
        plr = plrs[i]
        negateFall(plr)
    }

    var lemmeInPlayers = world.getPlayers({ tags: ['horigins.raccoon.lemmein'] })

    for (let i = 0; i < lemmeInPlayers.length; i++) {
        var plr = lemmeInPlayers[i]

        plr.removeTag("horigins.raccoon.lemmein")
        var lv = plr.getViewDirection()
        function addVector3(vector31, vector32) {
            return { x: vector31.x + vector32.x, y: vector31.y + vector32.y, z: vector31.z + vector32.z }
        }

        function multiplyVector(vector, multiplier) {
            return { x: vector.x * multiplier, y: vector.y * multiplier, z: vector.z * multiplier }
        }
        plr.teleport(addVector3(plr.location, multiplyVector(lv, 2)))
    }

})

