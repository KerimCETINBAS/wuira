/** Client files shipped with WoW. Names are catalog keys; paths are what the game resolves. */

export interface ClientMedia {
    readonly label: string;
    readonly path: string;
}

export interface ClientBorder extends ClientMedia {
    readonly edgeSize: number;
}

export const progressTextures = {
    solid: { label: "Solid", path: "Interface\\Buttons\\WHITE8X8" },
    blizzard: { label: "Blizzard", path: "Interface\\TargetingFrame\\UI-StatusBar" },
    skills: { label: "Blizzard Character Skills Bar", path: "Interface\\PaperDollInfoFrame\\UI-Character-Skills-Bar" },
    raid: { label: "Blizzard Raid Bar", path: "Interface\\RaidFrame\\Raid-Bar-Hp-Fill" },
} as const satisfies Record<string, ClientMedia>;

export const backgroundTextures = {
    solid: { label: "Solid", path: "Interface\\Buttons\\WHITE8X8" },
    tooltip: { label: "Blizzard Tooltip", path: "Interface\\Tooltips\\UI-Tooltip-Background" },
    dialog: { label: "Blizzard Dialog", path: "Interface\\DialogFrame\\UI-DialogBox-Background" },
    dialogDark: { label: "Blizzard Dialog Dark", path: "Interface\\DialogFrame\\UI-DialogBox-Background-Dark" },
    dialogGold: { label: "Blizzard Dialog Gold", path: "Interface\\DialogFrame\\UI-DialogBox-Gold-Background" },
    collections: { label: "Blizzard Collections", path: "Interface\\Collections\\CollectionsBackgroundTile" },
    garrison: { label: "Blizzard Garrison", path: "Interface\\Garrison\\GarrisonUIBackground" },
    garrisonAlt: { label: "Blizzard Garrison 2", path: "Interface\\Garrison\\GarrisonUIBackground2" },
    garrisonMission: { label: "Blizzard Garrison Mission", path: "Interface\\Garrison\\GarrisonMissionUIInfoBoxBackgroundTile" },
    lowHealth: { label: "Blizzard Low Health", path: "Interface\\FullScreenTextures\\LowHealth" },
    marble: { label: "Blizzard Marble", path: "Interface\\FrameGeneral\\UI-Background-Marble" },
    outOfControl: { label: "Blizzard Out of Control", path: "Interface\\FullScreenTextures\\OutOfControl" },
    parchment: { label: "Blizzard Parchment", path: "Interface\\AchievementFrame\\UI-Achievement-Parchment-Horizontal" },
    parchmentGuild: { label: "Blizzard Parchment Guild", path: "Interface\\AchievementFrame\\UI-GuildAchievement-Parchment-Horizontal" },
    rock: { label: "Blizzard Rock", path: "Interface\\FrameGeneral\\UI-Background-Rock" },
    tabard: { label: "Blizzard Tabard", path: "Interface\\TabardFrame\\TabardFrameBackground" },
} as const satisfies Record<string, ClientMedia>;

export const borderTextures = {
    solid: { label: "Solid", path: "", edgeSize: 1 },
    tooltip: { label: "Blizzard Tooltip", path: "Interface\\Tooltips\\UI-Tooltip-Border", edgeSize: 16 },
    dialog: { label: "Blizzard Dialog", path: "Interface\\DialogFrame\\UI-DialogBox-Border", edgeSize: 32 },
    dialogGold: { label: "Blizzard Dialog Gold", path: "Interface\\DialogFrame\\UI-DialogBox-Gold-Border", edgeSize: 32 },
    achievementWood: { label: "Blizzard Achievement Wood", path: "Interface\\AchievementFrame\\UI-Achievement-WoodBorder", edgeSize: 16 },
    chatBubble: { label: "Blizzard Chat Bubble", path: "Interface\\Tooltips\\ChatBubble-Backdrop", edgeSize: 16 },
    party: { label: "Blizzard Party", path: "Interface\\CHARACTERFRAME\\UI-Party-Border", edgeSize: 16 },
} as const satisfies Record<string, ClientBorder>;

/** Latin-capable faces present in every client locale. Cyrillic duplicates stay out. */
export const clientFonts = {
    friz: { label: "Friz Quadrata", path: "Fonts\\FRIZQT__.TTF" },
    arialNarrow: { label: "Arial Narrow", path: "Fonts\\ARIALN.TTF" },
    morpheus: { label: "Morpheus", path: "Fonts\\MORPHEUS.TTF" },
    skurri: { label: "Skurri", path: "Fonts\\SKURRI.TTF" },
    twoThousand: { label: "2002", path: "Fonts\\2002.TTF" },
    twoThousandBold: { label: "2002 Bold", path: "Fonts\\2002B.TTF" },
    hei: { label: "AR CrystalzcuheiGBK Demibold", path: "Fonts\\ARHei.TTF" },
    zhongkaiCombat: { label: "AR ZhongkaiGBK Medium (Combat)", path: "Fonts\\ARKai_C.TTF" },
    zhongkai: { label: "AR ZhongkaiGBK Medium", path: "Fonts\\ARKai_T.TTF" },
    mok: { label: "MoK", path: "Fonts\\K_Pagetext.TTF" },
    nimrod: { label: "Nimrod MT", path: "Fonts\\NIM_____.ttf" },
} as const satisfies Record<string, ClientMedia>;

export function resolveMediaPath(catalog: Readonly<Record<string, ClientMedia>>, value: string): string {
    return catalog[value]?.path ?? value;
}
