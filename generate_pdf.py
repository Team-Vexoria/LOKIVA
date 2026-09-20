import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#5B6B8C"))
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 40, 25, page_text)
        self.drawString(40, 25, "LOKIVA: Autonomous Cultural Experience Engine | Project Overview")
        self.setStrokeColor(colors.HexColor("#E5DFD5"))
        self.setLineWidth(0.5)
        self.line(40, 36, A4[0] - 40, 36)
        self.restoreState()


def build_pdf(filename="LOKIVA_Project_Overview.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=46,
    )

    styles = getSampleStyleSheet()

    # Color Palette
    c_ink = colors.HexColor("#12213B")
    c_terracotta = colors.HexColor("#C1443B")
    c_amber = colors.HexColor("#FFC067")
    c_dusk = colors.HexColor("#5B6B8C")
    c_border = colors.HexColor("#E5DFD5")
    c_bg_light = colors.HexColor("#FAF8F5")
    c_header_bg = colors.HexColor("#F5EFE6")

    # Typography Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_ink,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=c_dusk,
        spaceAfter=12,
    )

    badge_style = ParagraphStyle(
        "Badge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=c_terracotta,
        alignment=0,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=c_ink,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=c_terracotta,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=c_ink,
        spaceAfter=6,
    )

    body_bold = ParagraphStyle(
        "BodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11.5,
        textColor=c_ink,
    )

    cell_header = ParagraphStyle(
        "TableCellHeader",
        parent=cell_style,
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=c_ink,
    )

    script_title = ParagraphStyle(
        "ScriptTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=c_ink,
    )

    script_visual = ParagraphStyle(
        "ScriptVisual",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=c_dusk,
    )

    script_narrator = ParagraphStyle(
        "ScriptNarrator",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=c_ink,
    )

    story = []

    # Title Banner Box
    banner_data = [
        [
            Paragraph("GOOGLE NOTEBOOKLM REFERENCE DOCUMENT", badge_style),
        ],
        [
            Paragraph("LOKIVA: Autonomous Cultural Experience Engine", title_style),
        ],
        [
            Paragraph(
                "Intelligent Pan-India Heritage Discovery and Two-Sided Artisan Marketplace",
                subtitle_style,
            ),
        ],
    ]
    banner_table = Table(banner_data, colWidths=[A4[0] - 72])
    banner_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFBF7")),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("LINEBEFORE", (0, 0), (0, -1), 4, c_terracotta),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ])
    )
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary and The High-Concept Hook", h1_style))
    story.append(
        Paragraph(
            "<b>What is LOKIVA?</b> LOKIVA is an autonomous cultural itinerary engine and two-sided artisan marketplace that connects travelers with real, living Indian heritage. While commercial travel platforms focus almost exclusively on selling hotel beds and flight seats, LOKIVA solves the actual experience on the ground.",
            body_style,
        )
    )
    story.append(
        Paragraph(
            "Using Google Gemini 1.5 multimodal AI and mathematical spatio-temporal constraint solvers, LOKIVA takes a traveler's exact remaining hours (such as a 4-hour Varanasi layover or a 3-hour evening gap in Jaipur), strict budget limit, accessibility requirements, and traveler persona, and instantly synthesizes a feasible, minute-by-minute cultural micro-circuit.",
            body_style,
        )
    )
    story.append(
        Paragraph(
            "Simultaneously, LOKIVA empowers generational Indian artisans, temple guilds, and master craftspeople through a vernacular voice studio, allowing rural artisans who cannot speak English or manage complex digital forms to list authentic workshops and receive direct traveler bookings via simulated instant UPI checkout.",
            body_style,
        )
    )
    story.append(Spacer(1, 6))

    # 2. The Problem
    story.append(Paragraph("2. The Problem: The Indian Cultural Travel Paradox", h1_style))
    story.append(
        Paragraph(
            "India possesses one of the oldest living cultural ecosystems in the world: over 3,000 distinctive living craft traditions, 450+ Geographical Indication (GI) tagged artisan specialties, and more than 100,000 historic monuments, temples, and stepwells. Yet, when travelers visit India or explore their own country, <b>over 88% of tourism spending flows into commercial hotel aggregators, standard bus tours, and generic tourist traps</b>.",
            body_style,
        )
    )

    prob_data = [
        [
            Paragraph("<b>1. Time-Constraint Failure</b>", cell_header),
            Paragraph("<b>2. The Digital Divide</b>", cell_header),
            Paragraph("<b>3. AI Hallucination Plague</b>", cell_header),
        ],
        [
            Paragraph(
                "Travelers with 2 to 5 hours before a train or flight have no reliable tool. Existing engines rank isolated venues without computing real ground transit bottlenecks or opening hours.",
                cell_style,
            ),
            Paragraph(
                "Master Rogan artists in Kutch or handloom weavers in Varanasi do not manage English web forms or credit card gateways. Rural craftspeople have zero marketing budget and remain invisible.",
                cell_style,
            ),
            Paragraph(
                "Generic travel chatbots hallucinate closed venues, non-existent hours, and broken photo links. Travelers cannot trust automated itineraries that fail when applied in the real world.",
                cell_style,
            ),
        ],
    ]
    prob_col_w = (A4[0] - 72) / 3
    prob_table = Table(prob_data, colWidths=[prob_col_w, prob_col_w, prob_col_w])
    prob_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), c_bg_light),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(prob_table)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # 3. The 11 Context Signals
    story.append(Paragraph("3. The 11 Context Signals Checked on Every Solve", h1_style))
    story.append(
        Paragraph(
            "Unlike conventional platforms that sort destinations by raw star ratings, LOKIVA evaluates 11 real-world variables simultaneously before rendering any plan:",
            body_style,
        )
    )

    signals_data = [
        [Paragraph("Context Signal", cell_header), Paragraph("How LOKIVA Solves It", cell_header)],
        [Paragraph("<b>1. Available Time Window</b>", cell_style), Paragraph("Enforces a mathematical hard stop before train departure, flight boarding, or hotel checkout.", cell_style)],
        [Paragraph("<b>2. Ground Transit Isochrones</b>", cell_style), Paragraph("Computes real pedestrian, auto-rickshaw, and street buffer transit times instead of straight-line distances.", cell_style)],
        [Paragraph("<b>3. Hard Budget Ceiling</b>", cell_style), Paragraph("Maintains a strict upper ceiling where the complete itinerary cost never exceeds the user's defined wallet limit.", cell_style)],
        [Paragraph("<b>4. Mobility & Accessibility</b>", cell_style), Paragraph("Verifies step-free access and wheelchair viability for elderly travelers and families.", cell_style)],
        [Paragraph("<b>5. Verified Operating Slots</b>", cell_style), Paragraph("Ensures destinations are confirmed open during the exact window of arrival.", cell_style)],
        [Paragraph("<b>6. Cultural Etiquette Rules</b>", cell_style), Paragraph("Flags dress codes, footwear removal rules, and photography bans in advance.", cell_style)],
        [Paragraph("<b>7. Pacing & Fatigue Limits</b>", cell_style), Paragraph("Applies walking distance thresholds based on party composition (seniors, children, solo explorers).", cell_style)],
        [Paragraph("<b>8. Dietary Integrity</b>", cell_style), Paragraph("Includes verified dining recommendations for pure vegetarian, Jain, and regional culinary traditions.", cell_style)],
        [Paragraph("<b>9. Live Weather Resilience</b>", cell_style), Paragraph("Prepares indoor atelier alternatives ready to activate if sudden rain occurs.", cell_style)],
        [Paragraph("<b>10. Transparent Explainability</b>", cell_style), Paragraph("Provides an honest 'Why this fits your constraints' justification for every selected stop.", cell_style)],
        [Paragraph("<b>11. Offline Resilience</b>", cell_style), Paragraph("Caches active itinerary data via IndexedDB and Service Workers for venues where mobile reception drops.", cell_style)],
    ]
    signals_table = Table(signals_data, colWidths=[160, A4[0] - 72 - 160])
    signals_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), c_header_bg),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 4.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(signals_table)
    story.append(Spacer(1, 10))

    # 4. Key Features & Modules
    story.append(Paragraph("4. Key Platform Features and Modules", h1_style))
    feat_data = [
        [
            Paragraph("<b>Interactive Onboarding Engine</b>", cell_header),
            Paragraph("<b>Artisan Vernacular Voice Studio</b>", cell_header),
        ],
        [
            Paragraph("Full-screen takeover modal with an 8-step dotted progress trail. Captures city, time gap, party type, walking tolerance, dietary preferences, and budget in under 60 seconds.", cell_style),
            Paragraph("Rural craftspeople speak in their local dialect (Hindi, Gujarati, Tamil, Bengali). Multimodal AI extracts craft history, pricing, and timing to generate a structured listing automatically.", cell_style),
        ],
        [
            Paragraph("<b>Simulated Instant UPI Checkout</b>", cell_header),
            Paragraph("<b>1-Click Live Adaptation Loop</b>", cell_header),
        ],
        [
            Paragraph("Travelers reserve workshops instantly using realistic UPI QR interfaces (GPay, PhonePe, Paytm). Direct payments ensure 100% of traveler spend reaches local artisans.", cell_style),
            Paragraph("If sudden monsoon rain hits or a venue closes unexpectedly, travelers click one button to dynamically re-solve their route, replacing outdoor stops with sheltered indoor workshops.", cell_style),
        ],
    ]
    feat_col_w = (A4[0] - 72) / 2
    feat_table = Table(feat_data, colWidths=[feat_col_w, feat_col_w])
    feat_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), c_bg_light),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(feat_table)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # 5. Architecture & Stack
    story.append(Paragraph("5. Technical Architecture and Stack", h1_style))
    tech_data = [
        [Paragraph("Layer", cell_header), Paragraph("Technologies", cell_header), Paragraph("Core Responsibilities", cell_header)],
        [Paragraph("<b>Frontend Web</b>", cell_style), Paragraph("React 18.3, TypeScript 5.0, Vite", cell_style), Paragraph("High-performance single-page app, type safety, modular client architecture.", cell_style)],
        [Paragraph("<b>Design & Motion</b>", cell_style), Paragraph("Tailwind CSS 3.4, Framer Motion, GSAP", cell_style), Paragraph("Sandstone Ivory design system, micro-interactions, scroll triggers.", cell_style)],
        [Paragraph("<b>Generative AI</b>", cell_style), Paragraph("Google Gemini 1.5 Pro & Flash", cell_style), Paragraph("Natural language intent extraction, conversational AI concierge, voice studio.", cell_style)],
        [Paragraph("<b>Spatial Routing</b>", cell_style), Paragraph("Haversine Algorithm, Transit Matrices", cell_style), Paragraph("Deterministic route sequencing, distance optimization, time buffer calculation.", cell_style)],
        [Paragraph("<b>Backend Services</b>", cell_style), Paragraph("Node.js Express, Python FastAPI", cell_style), Paragraph("REST API orchestration, constraint solver engine, session handling.", cell_style)],
        [Paragraph("<b>Storage & Offline</b>", cell_style), Paragraph("Firestore, Firebase Auth, IndexedDB", cell_style), Paragraph("User profiles, real-time itinerary persistence, offline PWA access.", cell_style)],
    ]
    tech_table = Table(tech_data, colWidths=[100, 150, A4[0] - 72 - 250])
    tech_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), c_header_bg),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 4.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # 6. Competitive Differentiation
    story.append(Paragraph("6. Competitive Differentiation Matrix", h1_style))
    comp_data = [
        [Paragraph("Dimension", cell_header), Paragraph("Commercial Aggregators", cell_header), Paragraph("Generic AI Chatbots", cell_header), Paragraph("LOKIVA Engine", cell_header)],
        [Paragraph("<b>Primary Focus</b>", cell_style), Paragraph("Hotel & flight bookings", cell_style), Paragraph("Text summary answers", cell_style), Paragraph("<b>Feasible cultural circuits</b>", cell_style)],
        [Paragraph("<b>Time Constraint</b>", cell_style), Paragraph("None (static lists)", cell_style), Paragraph("Unreliable time estimates", cell_style), Paragraph("<b>Mathematical feasibility solve</b>", cell_style)],
        [Paragraph("<b>Data Accuracy</b>", cell_style), Paragraph("Crowdsourced, frequent spam", cell_style), Paragraph("Prone to hallucinations", cell_style), Paragraph("<b>100% human-verified catalog</b>", cell_style)],
        [Paragraph("<b>Artisan Access</b>", cell_style), Paragraph("English web portals only", cell_style), Paragraph("No marketplace connection", cell_style), Paragraph("<b>Vernacular voice studio</b>", cell_style)],
        [Paragraph("<b>Disruption Handling</b>", cell_style), Paragraph("Manual cancellations", cell_style), Paragraph("Start over from scratch", cell_style), Paragraph("<b>1-Click Live Adaptation Loop</b>", cell_style)],
    ]
    comp_col = (A4[0] - 72) / 4
    comp_table = Table(comp_data, colWidths=[comp_col, comp_col, comp_col, comp_col])
    comp_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), c_header_bg),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 4.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(comp_table)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # 7. Video Script Blueprint
    story.append(Paragraph("7. Cinematic Video Script Blueprint for Google NotebookLM", h1_style))
    story.append(
        Paragraph(
            "Use this 4-act narrative blueprint in Google NotebookLM to generate a video voiceover, explainer reel, or podcast episode.",
            body_style,
        )
    )

    acts = [
        (
            "Act I: The Paradox (0:00 to 0:45)",
            "Visual: Sweeping drone shots of ancient stepwells and handloom weavers, transitioning to crowded hotel lobbies and stranded airport tourists.",
            "\"India holds over 3,000 living craft traditions and 100,000 sacred architectural wonders. Yet, over 88% of travel spending is locked inside generic hotel aggregators. Travelers with three or four spare hours find themselves stranded in airport lounges or caught in gridlock traffic, while generational master artisans remain completely invisible.\"",
        ),
        (
            "Act II: The Engine (0:45 to 1:45)",
            "Visual: The LOKIVA interface opens smoothly. A traveler inputs four hours in Jaipur with family. The 11-signal constraint solver calculates routes in real time.",
            "\"Meet LOKIVA: the autonomous cultural experience engine. Instead of selling hotel beds, LOKIVA packages your exact constraints: your remaining hours, your strict budget, and your mobility needs: into feasible, minute-by-minute cultural micro-circuits that actually work in real life.\"",
        ),
        (
            "Act III: The Artisan Bridge (1:45 to 2:30)",
            "Visual: An artisan speaks in Gujarati; Gemini AI formats the listing. A traveler completes simulated UPI checkout and receives a digital QR admission pass.",
            "\"LOKIVA is also a two-sided marketplace. Master artisans speak in their native tongue, and our AI co-pilot creates verified listings in seconds, directing 100% of traveler spend to local hands. And if rain hits? One click adapts your entire route to sheltered indoor heritage.\"",
        ),
        (
            "Act IV: Call to Action (2:30 to 3:00)",
            "Visual: The pan-India 36-state discovery map illuminates, finishing on the Sandstone Ivory LOKIVA brand display.",
            "\"Real Indian cultural experiences, packed around your exact constraints. Welcome to conscious heritage discovery. Welcome to LOKIVA.\"",
        ),
    ]

    for title, visual, narrator in acts:
        act_content = [
            [Paragraph(title, script_title)],
            [Paragraph(visual, script_visual)],
            [Paragraph(narrator, script_narrator)],
        ]
        act_table = Table(act_content, colWidths=[A4[0] - 72])
        act_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFDF9")),
                ("BOX", (0, 0), (-1, -1), 0.5, c_border),
                ("LINEBEFORE", (0, 0), (0, -1), 3, c_amber),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(act_table)
        story.append(Spacer(1, 6))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename} ({os.path.getsize(filename)} bytes)")


if __name__ == "__main__":
    build_pdf()
