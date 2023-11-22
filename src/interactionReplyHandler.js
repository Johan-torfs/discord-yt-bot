export class Interaction {
    constructor(interaction) {
        this.deferred = false;
        this.deferCount = 0;
        this.replied = false;
        this.replyCount = 0;
        this.interaction = interaction;
        this.firstInteractionDefer = false;
        this.interactionDefer(interaction);
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
        this.deferCount++;

        try {
            await interaction.deferReply(options);
            this.deferred = true;
        } catch (error) {
            if (error.code = 'InteractionAlreadyReplied') {
                console.log('Interaction already replied or deferred!');
                this.deferred = true;
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.interactionDefer(interaction, options);
        }

        this.firstInteractionDefer = true;
    }
    
    async interactionReply(interaction, options = {}) {
        if (!this.firstInteractionDefer) await new Promise(resolve => setTimeout(resolve, 500));

        if (this.replyCount > 5) {
            try {
                await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
            } catch (error) {
                if (error.code = 40060) {
                    console.log('Interaction has already been acknowledged.');
                    this.replied = true;
                    return;
                }
                console.log(error);
            }
            return;
        }
        this.replyCount++;

        if (this.deferred) {
            try {
                await interaction.followUp(options);
                this.replied = true;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.interactionReply(interaction, options);
            }
        } else {
            await this.interactionDefer(interaction, options);
            await this.interactionReply(interaction, options);
        }
    }
}