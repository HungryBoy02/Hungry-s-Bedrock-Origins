// I made this one tho :3 -HungryBoy02

import { Player } from '@minecraft/server';
import { CustomFormFormData, uiTypes } from './custom_forms/custom_forms.js'

const examplePages = [
    {
        title: "Intro to origins (1)",
        body: "You may have noticed that, unlike other origins addons, you don't choose your origin right away. To choose your origin, eat your origin cookie"
    },
    {
        title: "Config (1)",
        body: "In this addon, abilities are activated by using emotes. You can choose which emote uses which origin ability, §cwith the exception of the '§aClapping§c' emote§r. This is because the clapping emote opens your origins configuration menu.",
        buttons: [
            { slot: 8 + (9 * 2), hoverText: "A picture of the clapping emote", lore: ["Used to open the origins menu"], texture: 'textures/ui/emotesliced/slice_0_1' }
        ]
    },
    {
        title: "Config (2)",
        body: "When you open your origins config menu, you'll see some neat menu options!\n\n1: The Ability remap menu\n\n2: Toggle abilities switch\n§8Hover over icons for more\ninfo",
        buttons: [
            { slot: 8 + (9 * 3), hoverText: "Origin Abilities remap button", lore: ["Opens the Abilities remap menu"], texture: 'textures/ui/originabilitiesbutton' },
            { slot: 8 + (9 * 4), hoverText: "Toggle abilities switch", lore: ["Allows you to emote without using abilities", "Clapping emote still opens menu"], texture: 'textures/ui/onoff' }
        ]
    },
    {
        title: "Origin Cookie",
        body: "After you eat your origin\ncookie, you may find your-\nself deciding you don't want to lock into an origin yet. That's okay! If you close the menu without choosing an origin, you get the cookie back and can choose again later.",
        buttons: [
            { slot: 8, hoverText: "Origin Cookie", lore: ["Allows you to choose an origin"], texture: 'textures/items/OriginCookie' }
        ]
    },
    {
        title: "To server admins:",
        body: "To recieve the ability to modify origin gamerules, run\n '§c/tag @s add horigins.admin§r'\nMore admin features will be added if they are requested (and reasonable)"
    }
]

const pageslots = {
    previous: 0 + (9 * 5),
    next: 8 + (9 * 5)
}
/**
* @remarks Shows a "book ui" to the player
* @param user The player being showed the ui
* @param pages The pages being used for the book, Formatted [ {title: "title text", body: "body text", (optional) buttons: [ {slot: slot where the button is, hoverText: "Text when you hover over the button", lore: ["lore","text"], texture: 'path/to/texture'} ]} ] buttons do not currently have a definable callback
* @param currentpage The current page the book is on, defaults to 0.
*/
const showBookUI = (user: Player, pages, currentpage) => {
    if (currentpage == null) {
        currentpage = 0
    }
    if (currentpage > pages.length - 1) {
        console.warn("Invalid PAGE ID")
        return
    }
    var UI = new CustomFormFormData("book")
    UI.title("§r" + pages[currentpage].title + " | Page " + (currentpage + 1).toString() + "/" + pages.length)
    UI.body(pages[currentpage].body)

    if (pages[currentpage].buttons != null) {
        for (let i = 0; i < pages[currentpage].buttons.length; i++) {
            UI.button(pages[currentpage].buttons[i].slot, pages[currentpage].buttons[i].hoverText, pages[currentpage].buttons[i].lore, pages[currentpage].buttons[i].texture)
        }
    }

    if ((currentpage + 1) < pages.length) {
        UI.button(pageslots.next, "Next Page", [""], 'textures/ui/ArrowRight', 1)
    }
    if (currentpage > 0) {
        UI.button(pageslots.previous, "Previous Page", [""], 'textures/ui/ArrowLeft', 1)
    }
    UI.show(user).then(response => {
        if (response.canceled) return;
        if (response.selection == pageslots.previous) {
            showBookUI(user, pages, currentpage - 1)
        } else if (response.selection == pageslots.next) {
            showBookUI(user, pages, currentpage + 1)
        } else {
            showBookUI(user, pages, currentpage)
        }
    })
}

export { showBookUI, examplePages };
