use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(UserProfile::Table)
                    .drop_column(UserProfile::Integrations)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Meta::Table)
                    .drop_column(Meta::EnableTwitterIntegration)
                    .drop_column(Meta::TwitterConsumerKey)
                    .drop_column(Meta::TwitterConsumerSecret)
                    .drop_column(Meta::EnableGithubIntegration)
                    .drop_column(Meta::GithubClientId)
                    .drop_column(Meta::GithubClientSecret)
                    .drop_column(Meta::EnableDiscordIntegration)
                    .drop_column(Meta::DiscordClientId)
                    .drop_column(Meta::DiscordClientSecret)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Meta::Table)
                    .add_column(ColumnDef::new(Meta::DiscordClientSecret).string())
                    .add_column(ColumnDef::new(Meta::DiscordClientId).string())
                    .add_column(
                        ColumnDef::new(Meta::EnableDiscordIntegration)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .add_column(ColumnDef::new(Meta::GithubClientSecret).string())
                    .add_column(ColumnDef::new(Meta::GithubClientId).string())
                    .add_column(
                        ColumnDef::new(Meta::EnableGithubIntegration)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .add_column(ColumnDef::new(Meta::TwitterConsumerSecret).string())
                    .add_column(ColumnDef::new(Meta::TwitterConsumerKey).string())
                    .add_column(
                        ColumnDef::new(Meta::EnableTwitterIntegration)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(UserProfile::Table)
                    .add_column(
                        ColumnDef::new(UserProfile::Integrations)
                            .json()
                            .default("{}"),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(Iden)]

enum UserProfile {
    Table,
    #[iden = "integrations"]
    Integrations,
}

#[derive(Iden)]
enum Meta {
    Table,
    #[iden = "enableTwitterIntegration"]
    EnableTwitterIntegration,
    #[iden = "twitterConsumerKey"]
    TwitterConsumerKey,
    #[iden = "twitterConsumerSecret"]
    TwitterConsumerSecret,
    #[iden = "enableGithubIntegration"]
    EnableGithubIntegration,
    #[iden = "githubClientId"]
    GithubClientId,
    #[iden = "githubClientSecret"]
    GithubClientSecret,
    #[iden = "enableDiscordIntegration"]
    EnableDiscordIntegration,
    #[iden = "discordClientId"]
    DiscordClientId,
    #[iden = "discordClientSecret"]
    DiscordClientSecret,
}
