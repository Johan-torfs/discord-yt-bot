export class Interaction {
    constructor(interaction) {
        this.deferred = false;
        this.deferCount = 0;
        this.replied = false;
        this.replyCount = 0;
        this.interaction = interaction;
        interactionDefer(interaction);
    }

    async interactionDefer(interaction, options = {}) {
        if (this.replied) return;
        if (this.deferCount > 5) {
            try {
                await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
            } catch (error) {
                console.log(error);
            }
            return;
        }

        try {
            await interaction.deferReply(options);
            this.deferred = true;
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await interactionDefer(interaction, options);
        }
        this.deferCount++;
    }
    
    async interactionReply(interaction, options = {}) {
        if (this.replyCount > 5) {
            try {
                await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
            } catch (error) {
                console.log(error);
            }
            return;
        }

        if (this.deferred) {
            try {
                await interaction.followUp(options);
                this.replied = true;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await interactionReply(interaction, options);
            }
        } else {
            await interactionDefer(interaction, options);
            await interactionReply(interaction, options);
        }
        this.replyCount++;
    }
}