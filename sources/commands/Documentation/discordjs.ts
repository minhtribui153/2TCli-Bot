import axios from "axios";
import { ICommand } from "wokcommands";

export default {
    category: "Documentation",
    description: "Displays Discord.JS Documentation",
    slash: true,
    options: [
        {
            name: 'query',
            description: "Query for documentation",
            type: "STRING",
            required: true,
        },
    ],
    callback: async ({ interaction }) => {

        interaction.deferReply()

        const query = interaction.options.getString('query') as string;
        
        const uri = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`;
        axios
            .get(uri)
            .then((embed) => {
                const { data } = embed;

                if (data && !data.error) {
                    interaction.editReply({ embeds: [data] })
                } else {
                    interaction.editReply({ content: "❌ Unable to find that documentation" });
                }
            })
            .catch(err => {
                interaction.editReply(`❌ Error: \`${err}\``);
            })

    }
} as ICommand;