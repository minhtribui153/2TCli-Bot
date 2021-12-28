import { ICommand } from "wokcommands";
import simplyDjs from "simply-djs";

export default {
    category: "Utility",
    description: "Sends in a calculator",
    slash: true,
    guildOnly: true,
    callback: async ({ interaction }) => {
        interaction.deferReply();
        await simplyDjs.calculator(interaction, {
            embedColor: "BLUE",
            credit: false,
            embedFooter: "Calculator"
        });
    }
} as ICommand;