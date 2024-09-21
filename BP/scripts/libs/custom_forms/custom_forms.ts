/*
This library is a modified version of Herobrine643928's Chest UI library. (https://github.com/Herobrine643928/Chest-UI)
It has been modified for my use case. -HungryBoy02
*/

import { ActionFormData } from '@minecraft/server-ui';

const types = new Map([
    ['chooseoriginsmain', [`§c§h§o§o§s§e§o§r§i§g§i§n§s§m§a§i§n`, 54]],
    ['originconfigmain', [`§o§r§i§g§i§n§c§o§n§f§i§g§m§a§i§n`, 54]],
    ['originconfigabilities', [`§o§r§i§g§i§n§c§o§n§f§i§g§a§b§i§l§i§t§i§e§s`, 54]],
    ['originabilityhelp', [`§o§r§i§g§i§n§a§b§i§l§i§t§y§h§e§l§p`, 54]],
    ['book', [`§b§o§o§k`, 54]],
]);
const uiTypes = {
    'chooseoriginsmain': 'chooseoriginsmain',
    'originconfigmain': 'originconfigmain',
    'originconfigabilities': 'originconfigabilities',
    'originabilityhelp': 'originabilityhelp',
    'book': 'book'
}

class CustomFormFormData {
    #titleText; #buttonArray; #body;
    /**
   * @param uitype The size of the ui. Can be 'chooseorigins', 'book' or 'originconfigmain'.
   */
    constructor(uitype) {

        const sizing = types.get(uitype) ?? [`§c§h§o§o§s§e§o§r§i§g§i§n§s`, 54];
        /** @internal */
        this.#titleText = '§g§u§i' + sizing[0] + "§r";
        this.#body = "";
        /** @internal */
        this.#buttonArray = [];
        for (let i = 0; i < sizing[1]; i++)
            this.#buttonArray.push(['', undefined]);
    }
    /**
   * @remarks This builder method sets the title for the ui.
   * @param text The title text for the ui.
   */
    title(text) {
        this.#titleText += text;
        return this;
    }
    /**
   * @remarks Sets the text for the body of the ui you're making
   * @param text Body text for your ui
   */
    body(text) {
        this.#body = text;
        return this;
    }
    /**
   * @remarks Adds a button to this ui with an icon from a resource pack.
   * @param slot The slot to display the item in.
   * @param itemName The name of the item to display.
   * @param itemDesc The item's lore to display.
   * @param iconPath The icon for the item.
   * @param stackAmount The stack size for the item.
   */
    button(slot, itemName, itemDesc, iconPath, stackSize = 1) {
        this.#buttonArray.splice(slot, 1, [`stack#${Math.min(Math.max(stackSize, 1) || 1, 99).toString().padStart(2, '0')}§r${itemName ?? ''}§r${itemDesc?.length ? `\n§r${itemDesc.join('\n§r')}` : ''}`, iconPath]);
        return this;
    }
    /**
    * @remarks
    * Creates and shows this modal popup form. Returns
    * asynchronously when the player confirms or cancels the
    * dialog.
    *
    * This function can't be called in read-only mode.
    *
    * @param player
    * Player to show this dialog to.
   */
    show(player) {
        const form = new ActionFormData()
        form.title(this.#titleText);
        form.body(this.#body);
        this.#buttonArray.forEach(button => {
            form.button(button[0], button[1]);
        })
        return form.show(player)
    }
}

export { CustomFormFormData, uiTypes };