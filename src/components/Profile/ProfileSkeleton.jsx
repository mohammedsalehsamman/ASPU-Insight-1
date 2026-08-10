export default function ProfileSkeleton() {
    return (
        <div className="profile-hero" style={{ minHeight: 320 }}>
            <div className="hero-inner" style={{ paddingTop: 40 }}>
                <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 32 }}>
                    <div style={{ width: 108, height: 108, borderRadius: "50%", background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ height: 16, width: "40%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                        <div style={{ height: 32, width: "60%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                        <div style={{ height: 14, width: "50%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}