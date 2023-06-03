//! `SeaORM` Entity. Generated by sea-orm-codegen 0.11.3

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Default)]
#[sea_orm(table_name = "drive_file")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    #[sea_orm(column_name = "createdAt")]
    pub created_at: DateTimeWithTimeZone,
    #[sea_orm(column_name = "userId")]
    pub user_id: Option<String>,
    #[sea_orm(column_name = "userHost")]
    pub user_host: Option<String>,
    pub md5: String,
    pub name: String,
    pub r#type: String,
    pub size: i32,
    pub comment: Option<String>,
    #[sea_orm(column_type = "JsonBinary")]
    pub properties: Json,
    #[sea_orm(column_name = "storedInternal")]
    pub stored_internal: bool,
    pub url: String,
    #[sea_orm(column_name = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    #[sea_orm(column_name = "webpublicUrl")]
    pub webpublic_url: Option<String>,
    #[sea_orm(column_name = "accessKey")]
    pub access_key: Option<String>,
    #[sea_orm(column_name = "thumbnailAccessKey")]
    pub thumbnail_access_key: Option<String>,
    #[sea_orm(column_name = "webpublicAccessKey")]
    pub webpublic_access_key: Option<String>,
    pub uri: Option<String>,
    pub src: Option<String>,
    #[sea_orm(column_name = "folderId")]
    pub folder_id: Option<String>,
    #[sea_orm(column_name = "isSensitive")]
    pub is_sensitive: bool,
    #[sea_orm(column_name = "isLink")]
    pub is_link: bool,
    pub blurhash: Option<String>,
    #[sea_orm(column_name = "webpublicType")]
    pub webpublic_type: Option<String>,
    #[sea_orm(column_name = "requestHeaders", column_type = "JsonBinary", nullable)]
    pub request_headers: Option<Json>,
    #[sea_orm(column_name = "requestIp")]
    pub request_ip: Option<String>,
    #[sea_orm(column_name = "maybeSensitive")]
    pub maybe_sensitive: bool,
    #[sea_orm(column_name = "maybePorn")]
    pub maybe_porn: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::channel::Entity")]
    Channel,
    #[sea_orm(
        belongs_to = "super::drive_folder::Entity",
        from = "Column::FolderId",
        to = "super::drive_folder::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    DriveFolder,
    #[sea_orm(has_many = "super::messaging_message::Entity")]
    MessagingMessage,
    #[sea_orm(has_many = "super::page::Entity")]
    Page,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    User,
}

impl Related<super::channel::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Channel.def()
    }
}

impl Related<super::drive_folder::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DriveFolder.def()
    }
}

impl Related<super::messaging_message::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MessagingMessage.def()
    }
}

impl Related<super::page::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Page.def()
    }
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
