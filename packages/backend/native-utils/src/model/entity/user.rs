//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.10

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "user")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    #[sea_orm(column_name = "createdAt")]
    pub created_at: DateTimeWithTimeZone,
    #[sea_orm(column_name = "updatedAt")]
    pub updated_at: Option<DateTimeWithTimeZone>,
    #[sea_orm(column_name = "lastFetchedAt")]
    pub last_fetched_at: Option<DateTimeWithTimeZone>,
    pub username: String,
    #[sea_orm(column_name = "usernameLower")]
    pub username_lower: String,
    pub name: Option<String>,
    #[sea_orm(column_name = "followersCount")]
    pub followers_count: i32,
    #[sea_orm(column_name = "followingCount")]
    pub following_count: i32,
    #[sea_orm(column_name = "notesCount")]
    pub notes_count: i32,
    #[sea_orm(column_name = "avatarId", unique)]
    pub avatar_id: Option<String>,
    #[sea_orm(column_name = "bannerId", unique)]
    pub banner_id: Option<String>,
    pub tags: Vec<String>,
    #[sea_orm(column_name = "isSuspended")]
    pub is_suspended: bool,
    #[sea_orm(column_name = "isSilenced")]
    pub is_silenced: bool,
    #[sea_orm(column_name = "isLocked")]
    pub is_locked: bool,
    #[sea_orm(column_name = "isBot")]
    pub is_bot: bool,
    #[sea_orm(column_name = "isCat")]
    pub is_cat: bool,
    #[sea_orm(column_name = "isAdmin")]
    pub is_admin: bool,
    #[sea_orm(column_name = "isModerator")]
    pub is_moderator: bool,
    pub emojis: Vec<String>,
    pub host: Option<String>,
    pub inbox: Option<String>,
    #[sea_orm(column_name = "sharedInbox")]
    pub shared_inbox: Option<String>,
    pub featured: Option<String>,
    pub uri: Option<String>,
    #[sea_orm(unique)]
    pub token: Option<String>,
    #[sea_orm(column_name = "isExplorable")]
    pub is_explorable: bool,
    #[sea_orm(column_name = "followersUri")]
    pub followers_uri: Option<String>,
    #[sea_orm(column_name = "lastActiveDate")]
    pub last_active_date: Option<DateTimeWithTimeZone>,
    #[sea_orm(column_name = "hideOnlineStatus")]
    pub hide_online_status: bool,
    #[sea_orm(column_name = "isDeleted")]
    pub is_deleted: bool,
    #[sea_orm(column_name = "driveCapacityOverrideMb")]
    pub drive_capacity_override_mb: Option<i32>,
    #[sea_orm(column_name = "movedToUri")]
    pub moved_to_uri: Option<String>,
    #[sea_orm(column_name = "alsoKnownAs", column_type = "Text", nullable)]
    pub also_known_as: Option<String>,
    #[sea_orm(column_name = "speakAsCat")]
    pub speak_as_cat: bool,
    #[sea_orm(column_name = "isIndexable")]
    pub is_indexable: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::access_token::Entity")]
    AccessToken,
    #[sea_orm(has_many = "super::announcement_read::Entity")]
    AnnouncementRead,
    #[sea_orm(has_many = "super::antenna::Entity")]
    Antenna,
    #[sea_orm(has_many = "super::app::Entity")]
    App,
    #[sea_orm(has_many = "super::attestation_challenge::Entity")]
    AttestationChallenge,
    #[sea_orm(has_many = "super::auth_session::Entity")]
    AuthSession,
    #[sea_orm(has_many = "super::channel::Entity")]
    Channel,
    #[sea_orm(has_many = "super::channel_following::Entity")]
    ChannelFollowing,
    #[sea_orm(has_many = "super::clip::Entity")]
    Clip,
    #[sea_orm(
        belongs_to = "super::drive_file::Entity",
        from = "Column::AvatarId",
        to = "super::drive_file::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    DriveFile2,
    #[sea_orm(
        belongs_to = "super::drive_file::Entity",
        from = "Column::BannerId",
        to = "super::drive_file::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    DriveFile1,
    #[sea_orm(has_many = "super::drive_folder::Entity")]
    DriveFolder,
    #[sea_orm(has_many = "super::gallery_like::Entity")]
    GalleryLike,
    #[sea_orm(has_many = "super::gallery_post::Entity")]
    GalleryPost,
    #[sea_orm(has_many = "super::meta::Entity")]
    Meta,
    #[sea_orm(has_many = "super::moderation_log::Entity")]
    ModerationLog,
    #[sea_orm(has_many = "super::muted_note::Entity")]
    MutedNote,
    #[sea_orm(has_many = "super::note::Entity")]
    Note,
    #[sea_orm(has_many = "super::note_favorite::Entity")]
    NoteFavorite,
    #[sea_orm(has_many = "super::note_reaction::Entity")]
    NoteReaction,
    #[sea_orm(has_many = "super::note_thread_muting::Entity")]
    NoteThreadMuting,
    #[sea_orm(has_many = "super::note_unread::Entity")]
    NoteUnread,
    #[sea_orm(has_many = "super::note_watching::Entity")]
    NoteWatching,
    #[sea_orm(has_many = "super::page::Entity")]
    Page,
    #[sea_orm(has_many = "super::page_like::Entity")]
    PageLike,
    #[sea_orm(has_many = "super::password_reset_request::Entity")]
    PasswordResetRequest,
    #[sea_orm(has_many = "super::poll_vote::Entity")]
    PollVote,
    #[sea_orm(has_many = "super::promo_read::Entity")]
    PromoRead,
    #[sea_orm(has_many = "super::registry_item::Entity")]
    RegistryItem,
    #[sea_orm(has_many = "super::signin::Entity")]
    Signin,
    #[sea_orm(has_many = "super::sw_subscription::Entity")]
    SwSubscription,
    #[sea_orm(has_many = "super::user_group::Entity")]
    UserGroup,
    #[sea_orm(has_many = "super::user_group_invitation::Entity")]
    UserGroupInvitation,
    #[sea_orm(has_many = "super::user_group_invite::Entity")]
    UserGroupInvite,
    #[sea_orm(has_many = "super::user_group_joining::Entity")]
    UserGroupJoining,
    #[sea_orm(has_one = "super::user_keypair::Entity")]
    UserKeypair,
    #[sea_orm(has_many = "super::user_list::Entity")]
    UserList,
    #[sea_orm(has_many = "super::user_list_joining::Entity")]
    UserListJoining,
    #[sea_orm(has_many = "super::user_note_pining::Entity")]
    UserNotePining,
    #[sea_orm(has_one = "super::user_profile::Entity")]
    UserProfile,
    #[sea_orm(has_one = "super::user_publickey::Entity")]
    UserPublickey,
    #[sea_orm(has_many = "super::user_security_key::Entity")]
    UserSecurityKey,
    #[sea_orm(has_many = "super::webhook::Entity")]
    Webhook,
}

impl Related<super::access_token::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AccessToken.def()
    }
}

impl Related<super::announcement_read::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AnnouncementRead.def()
    }
}

impl Related<super::antenna::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Antenna.def()
    }
}

impl Related<super::app::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::App.def()
    }
}

impl Related<super::attestation_challenge::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AttestationChallenge.def()
    }
}

impl Related<super::auth_session::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AuthSession.def()
    }
}

impl Related<super::channel::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Channel.def()
    }
}

impl Related<super::channel_following::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ChannelFollowing.def()
    }
}

impl Related<super::clip::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Clip.def()
    }
}

impl Related<super::drive_folder::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DriveFolder.def()
    }
}

impl Related<super::gallery_like::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::GalleryLike.def()
    }
}

impl Related<super::gallery_post::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::GalleryPost.def()
    }
}

impl Related<super::meta::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Meta.def()
    }
}

impl Related<super::moderation_log::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ModerationLog.def()
    }
}

impl Related<super::muted_note::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MutedNote.def()
    }
}

impl Related<super::note::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Note.def()
    }
}

impl Related<super::note_favorite::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NoteFavorite.def()
    }
}

impl Related<super::note_reaction::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NoteReaction.def()
    }
}

impl Related<super::note_thread_muting::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NoteThreadMuting.def()
    }
}

impl Related<super::note_unread::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NoteUnread.def()
    }
}

impl Related<super::note_watching::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::NoteWatching.def()
    }
}

impl Related<super::page::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Page.def()
    }
}

impl Related<super::page_like::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PageLike.def()
    }
}

impl Related<super::password_reset_request::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PasswordResetRequest.def()
    }
}

impl Related<super::poll_vote::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollVote.def()
    }
}

impl Related<super::promo_read::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PromoRead.def()
    }
}

impl Related<super::registry_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RegistryItem.def()
    }
}

impl Related<super::signin::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Signin.def()
    }
}

impl Related<super::sw_subscription::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SwSubscription.def()
    }
}

impl Related<super::user_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserGroup.def()
    }
}

impl Related<super::user_group_invitation::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserGroupInvitation.def()
    }
}

impl Related<super::user_group_invite::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserGroupInvite.def()
    }
}

impl Related<super::user_group_joining::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserGroupJoining.def()
    }
}

impl Related<super::user_keypair::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserKeypair.def()
    }
}

impl Related<super::user_list::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserList.def()
    }
}

impl Related<super::user_list_joining::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserListJoining.def()
    }
}

impl Related<super::user_note_pining::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserNotePining.def()
    }
}

impl Related<super::user_profile::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserProfile.def()
    }
}

impl Related<super::user_publickey::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserPublickey.def()
    }
}

impl Related<super::user_security_key::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserSecurityKey.def()
    }
}

impl Related<super::webhook::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Webhook.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
