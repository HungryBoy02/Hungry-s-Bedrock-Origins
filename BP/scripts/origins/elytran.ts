import { registerOrigin, registerOriginGamerule, getGameruleValue } from '../libs/horiginsapi.js'
import { system, world, EntityComponentTypes, EquipmentSlot, ItemStack } from '@minecraft/server'

const originId = 'horiginselytran' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
//                                     (so this one's tag would actually be "horigins.origin.horiginsfox")
const originTitle = "Elytran" // What your origin is called
const iconTexture = 'textures/items/elytra' // The icon for your origin
const shortDescription = " Elytran, you can fly." // Your origin's short description
const longDescription = "You permanantly have an elytra, but you have 4 less hearts\n You deal more damage while gliding\n  You cannot unequip the elytra"
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    { id: 'health', value: '12' }//, // Health up to 149, no decimals
    //{ id: 'exhaustion', value: 'nonefrommovement' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    //{ id: 'breathable', value: 'land' }, // Acceptable values are 'land' and 'underwater'
    //{ id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    //{ id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    //{ id: 'scale', value: '0.75' }, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    //{ id: 'movement', value: '0.15' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

const abilities = [
    {
        abilityId: 'horigins.elytran.launch',
        abilityName: 'Boost', // Self explanitory
        abilityDescription: 'Get a boost while flying, or get a starting jump to fly. [30s cooldown]', // Self explanitory
        abilityIcon: 'textures/items/feather', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 30 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
world.afterEvents.worldInitialize.subscribe(() => {
    registerOrigin(originId, originTitle, abilities, componentModifications, /*damageTypeImmunities,*/ iconTexture, shortDescription, longDescription)
})


// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!
var cooldown = 5 * 20
var currentCool = 0
system.runInterval(() => {
    // First we get if anyone has activated their pounce ability
    var launchers = world.getPlayers({ tags: ['horigins.elytran.launch'] })

    for (let i = 0; i < launchers.length; i++) {
        var plr = launchers[i]

        plr.removeTag("horigins.elytran.launch")
        plr.applyKnockback(plr.getVelocity().x, plr.getVelocity().z, 3, plr.getVelocity().y + 2)
    }

    var elytrans = world.getPlayers({ tags: ['horigins.origin.horiginselytran'] })

    if (currentCool >= cooldown) {
        currentCool = 0
        for (let i = 0; i < elytrans.length; i++) {
            var plr = elytrans[i]
            const equipmentCompPlayer = plr.getComponent(EntityComponentTypes.Equippable);
            if (equipmentCompPlayer) {
                var elytra = equipmentCompPlayer.getEquipment(EquipmentSlot.Chest)
                if (elytra) {
                    var durability = elytra.getComponent("minecraft:durability")
                    if (durability) {
                        if (durability.damage > 50) {
                            var itemst = new ItemStack("minecraft:elytra")
                            itemst.keepOnDeath = true
                            itemst.lockMode = "slot"
                            itemst.setDynamicProperty("horigins.originitem", true)
                            equipmentCompPlayer.setEquipment(EquipmentSlot.Chest, itemst);
                        }
                    }
                } else {
                    var itemst = new ItemStack("minecraft:elytra")
                    itemst.keepOnDeath = true
                    itemst.lockMode = "slot"
                    itemst.setDynamicProperty("horigins.originitem", true)
                    equipmentCompPlayer.setEquipment(EquipmentSlot.Chest, itemst);
                }

            }

        }
    }
    currentCool++;

    for (let i = 0; i < elytrans.length; i++) {
        var plr = elytrans[i]
        if (plr.isGliding) {
            plr.addEffect("strength", 10, { showParticles: false })
        }
    }
})

