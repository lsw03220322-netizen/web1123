import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# 1. Register Korean Fonts
pdfmetrics.registerFont(TTFont('Malgun', 'C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MalgunBold', 'C:/Windows/Fonts/malgunbd.ttf'))

# 2. NumberedCanvas for header/footer
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
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.setFont('Malgun', 8)
            self.setFillColor(colors.HexColor('#64748B'))
            self.drawString(18 * mm, 282 * mm, "신기한 입체도형 전개도 교구 설명서 (DIY & 학습 가이드)")
            self.drawRightString(192 * mm, 282 * mm, "YouTube Shorts 분석 리포트")
            self.setStrokeColor(colors.HexColor('#CBD5E1'))
            self.setLineWidth(0.6)
            self.line(18 * mm, 280 * mm, 192 * mm, 280 * mm)

        # Footer (all pages)
        self.setFont('Malgun', 8)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(18 * mm, 11 * mm, "출처 영상: 요즘 엄마들이 찾는 신기한 도형 교구 (@moonshotkidz)")
        self.drawRightString(192 * mm, 11 * mm, f"페이지 {self._pageNumber} / {page_count}")
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
        self.restoreState()

def create_manual():
    pdf_filename = "신기한_입체도형_전개도_교구_설명서.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    content_w = 174 * mm

    # Styles
    styles = getSampleStyleSheet()
    
    # Custom Korean Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='MalgunBold',
        fontSize=20,
        leading=26,
        textColor=colors.HexColor('#1E293B'),
        alignment=1, # Center
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='MalgunBold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=10,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='MalgunBold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0F766E'),
        spaceBefore=6,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=9.2,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=styles['Normal'],
        fontName='MalgunBold',
        fontSize=9.2,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=5
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B'),
        alignment=1,
        spaceAfter=6
    )

    tip_style = ParagraphStyle(
        'Tip_Custom',
        parent=styles['Normal'],
        fontName='Malgun',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#1E3A8A')
    )

    story = []

    # ==========================================
    # PAGE 1: 표지 및 개요 (Cover & Overview)
    # ==========================================
    # Header Banner Card
    banner_data = [
        [Paragraph("<font color='white' size='8'><b>초등 수학 입체도형 완벽 대비 | 오감 자극 핸즈온(Hands-on) 교구 가이드</b></font>", ParagraphStyle('w1', fontName='MalgunBold', alignment=1))],
        [Paragraph("<font color='white' size='17'><b>당기면 마법처럼 펼쳐지는 '입체도형 전개도' 설명서</b></font>", ParagraphStyle('w2', fontName='MalgunBold', alignment=1, leading=22))],
        [Paragraph("<font color='#E2E8F0' size='9'>평면 전개도(2D)와 입체도형(3D)의 유기적 연결 원리를 한눈에 깨우치는 스트링 팝업 교구</font>", ParagraphStyle('w3', fontName='Malgun', alignment=1, leading=13))]
    ]
    banner_table = Table(banner_data, colWidths=[content_w])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # Video Info & Highlights (2 Columns: Left Image, Right Summary)
    intro_img = RLImage('processed_images/img_01_intro.jpg', width=68*mm, height=85*mm)
    
    right_info_html = """
    <b>■ 영상 핵심 정보 요약</b><br/>
    • <b>영상 제목:</b> 요즘 엄마들이 찾는 신기한 도형 교구입니다<br/>
    • <b>주요 태그:</b> #입체도형DIY #초등준비 #아이교육<br/>
    • <b>출처 채널:</b> @moonshotkidz (YouTube Shorts)<br/>
    • <b>권장 대상:</b> 6세 ~ 초등 6학년 (초등 5·6학년 도형 단원 필독)<br/>
    • <b>핵심 기능:</b> 끈을 가볍게 잡아당기면 평면 전개도가 즉시 3D 입체도형으로 자립(Pop-up)<br/>
    <br/>
    <b>■ 왜 요즘 학부모들에게 큰 주목을 받을까?</b><br/>
    초등학교 수학에서 아이들이 가장 어려워하는 고비 중 하나가 바로 <b>'입체도형의 전개도와 겨냥도'</b>입니다. 종이에 인쇄된 2D 평면 그림만 보고 머릿속으로 접어 올리는 공간지각 추론은 추상적 사고가 덜 발달한 아이들에게 큰 부담이 됩니다.<br/>
    <br/>
    본 교구는 끈을 당기는 즉각적인 물리적 인장력을 통해 <b>평면(전개도)과 입체(완성 도형)가 어떻게 닫히고 열리는지 눈과 손으로 직관적 확인</b>이 가능하여, 공식을 외우지 않고도 입체도형의 면, 모서리, 꼭짓점 관계를 자연스럽게 체득하게 합니다.
    """
    right_info_p = Paragraph(right_info_html, body_style)

    overview_table = Table([[intro_img, right_info_p]], colWidths=[72*mm, 102*mm])
    overview_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 10))

    # Core Mechanism Callout Box
    mech_html = """
    <b>💡 교구의 핵심 작동 원리: '스트링 텐션 힌지(String Tension Hinge) 메커니즘'</b><br/>
    전개도의 외곽 꼭짓점에 정밀하게 펀칭 홀(Hole)을 뚫고, 유연한 끈을 지그재그 또는 루프 형태로 관통시킵니다. 끈의 양끝을 잡아당기면 각 면의 끝점들이 중심 또는 맞닿는 모서리로 동시에 수렴하면서 접는 선을 축으로 회전하여 3차원 입체 구조를 형성합니다. 끈을 놓으면 종이 본래의 탄성으로 다시 평면으로 펼쳐집니다.
    """
    mech_p = Paragraph(mech_html, tip_style)
    mech_box = Table([[mech_p]], colWidths=[content_w])
    mech_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(mech_box)
    story.append(PageBreak())

    # ==========================================
    # PAGE 2: 주요 도형 분석 1 (직육면체 & 삼각기둥)
    # ==========================================
    story.append(Paragraph("1. 주요 입체도형별 구조 및 전개도 분석 (기둥 도형)", h1_style))
    story.append(Paragraph("영상에서 다룬 대표적인 기둥(Prism) 형태 도형들의 평면 전개도와 입체 조립 메커니즘을 상세히 분석합니다.", body_style))
    story.append(Spacer(1, 4))

    # 도형 1: 직육면체 (Cuboid)
    story.append(Paragraph("① 직육면체 (Rectangular Prism / Cuboid)", h2_style))
    cuboid_desc = """
    • <b>구성 면:</b> 크기와 모양이 서로 다른 3쌍의 직사각형 (총 6개 면)<br/>
    • <b>전개도 특징:</b> 밑면과 옆면이 십자 형태로 배치되어 있으며, 마주보는 면끼리 완벽히 포개어지는 구조입니다.<br/>
    • <b>끈 연결 방식:</b> 상단 덮개 면과 양쪽 측면 날개의 끝단 홀에 끈을 통과시켜, 하단으로 돌출된 두 가닥의 끈을 동시에 당기도록 설계되었습니다.<br/>
    • <b>교육 관찰 포인트:</b> 마주보는 면이 서로 평행하고 크기가 완전히 같다는 점을 줄을 당기며 닫히는 과정에서 명확히 확인할 수 있습니다.
    """
    story.append(Paragraph(cuboid_desc, body_style))
    cuboid_img = RLImage('processed_images/comp_cuboid.jpg', width=content_w, height=62*mm)
    story.append(cuboid_img)
    story.append(Paragraph("▲ [화면 캡처] 직육면체: (좌) 바닥에 펼쳐진 평면 전개도 → (우) 끈을 당겨 완성된 직육면체 입체 구조", caption_style))
    story.append(Spacer(1, 10))

    # 도형 2: 삼각기둥 (Triangular Prism)
    story.append(Paragraph("② 삼각기둥 (Triangular Prism)", h2_style))
    triprism_desc = """
    • <b>구성 면:</b> 합동인 정삼각형(밑면) 2개 + 직사각형(옆면) 3개 (총 5개 면)<br/>
    • <b>전개도 특징:</b> 중앙의 직사각형 3개가 나란히 연결되어 있고, 상단과 하단에 삼각형 밑면이 배치된 구조입니다.<br/>
    • <b>끈 연결 방식:</b> 삼각형 밑면의 꼭짓점 홀과 마주보는 옆면 홀을 대각선으로 관통하여, 줄을 당기는 즉시 옆면이 ㄷ자 형태로 꺾이고 삼각형 뚜껑이 닫힙니다.<br/>
    • <b>교육 관찰 포인트:</b> 기둥의 이름은 밑면의 모양(삼각형)에 의해 결정된다는 수학적 정의를 직관적으로 이해할 수 있습니다.
    """
    story.append(Paragraph(triprism_desc, body_style))
    triprism_img = RLImage('processed_images/comp_triprism.jpg', width=content_w, height=62*mm)
    story.append(triprism_img)
    story.append(Paragraph("▲ [화면 캡처] 삼각기둥: (좌) 실이 꿰어진 평면 전개도 → (우) 끈을 당겨 직각으로 세워진 삼각기둥", caption_style))
    story.append(PageBreak())

    # ==========================================
    # PAGE 3: 주요 도형 분석 2 (정육면체 & 원기둥)
    # ==========================================
    story.append(Paragraph("2. 주요 입체도형별 구조 및 전개도 분석 (정육면체 & 원기둥)", h1_style))
    story.append(Paragraph("초등학교 5·6학년 수학 교과에서 가장 비중 있게 다뤄지는 정육면체와 원기둥의 메커니즘입니다.", body_style))
    story.append(Spacer(1, 4))

    # 도형 3: 정육면체 (Cube)
    story.append(Paragraph("③ 정육면체 (Cube) - 'PULL' 당김 탭 연동", h2_style))
    cube_desc = """
    • <b>구성 면:</b> 크기가 모두 같은 정사각형 6개 (초등 5학년 2학기 핵심 단원)<br/>
    • <b>특수 설계:</b> 전개도 하단에 종이 손잡이(PULL)가 부착되어 있어 아이들이 양손으로 손잡이를 쥐고 당기기 매우 용이합니다.<br/>
    • <b>끈 연결 방식:</b> 정육면체 전개도의 외곽 모서리 홀에 실을 X자형으로 교차 관통시켜, 끈을 당기면 6개의 모든 면이 한 번에 중심으로 오므라들며 정육면체 상자가 완성됩니다.<br/>
    • <b>학습 효과:</b> 정육면체 전개도가 될 수 있는 형태(총 11가지) 중 대표적인 지그재그형 전개도의 입체 접힘을 쉽게 증명합니다.
    """
    story.append(Paragraph(cube_desc, body_style))
    cube_img = RLImage('processed_images/comp_cube.jpg', width=content_w, height=62*mm)
    story.append(cube_img)
    story.append(Paragraph("▲ [화면 캡처] 정육면체: (좌) PULL 탭이 연결된 전개도 → (우) 끈을 당겨 사방이 완벽히 맞물린 정육면체", caption_style))
    story.append(Spacer(1, 10))

    # 도형 4: 원기둥 (Cylinder)
    story.append(Paragraph("④ 원기둥 (Cylinder) - 영상 속 실제 치수 분석", h2_style))
    cylinder_desc = """
    • <b>구성 면:</b> 서로 평행하고 합동인 원 2개(밑면) + 직사각형 1개(옆면)<br/>
    • <b>영상 속 실측 치수(Dimensions):</b><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <b>옆면 직사각형:</b> 가로 18cm, 높이(세로) 9cm<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;- <b>밑면 원:</b> 반지름(r) 2.5cm (지름 5cm)<br/>
    • <b>수학적 원리 증명:</b> 원기둥 전개도에서 '옆면의 가로 길이'는 '밑면 원의 둘레(원주)'와 일치해야 합니다.<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<b>[원주 계산 공식]</b> 밑면 원의 둘레 = 2 × π × r = 2 × 3.14 × 2.5cm = <b>15.7cm</b><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;※ 영상 속 도안은 종이가 겹쳐서 원기둥 형태로 안정적으로 맞물리도록 약 2.3cm의 여유분(접착/겹침 오버랩)을 포함하여 18cm로 재단되었습니다.
    """
    story.append(Paragraph(cylinder_desc, body_style))
    cylinder_img = RLImage('processed_images/comp_cylinder.jpg', width=content_w, height=62*mm)
    story.append(cylinder_img)
    story.append(Paragraph("▲ [화면 캡처] 원기둥: (좌) 실제 치수(18cm, 9cm, 2.5cm)가 표기된 전개도 → (우) 줄을 당겨 완성된 곡면 원기둥", caption_style))
    story.append(PageBreak())

    # ==========================================
    # PAGE 4: 육각뿔 & DIY 제작 가이드
    # ==========================================
    story.append(Paragraph("3. 뿔(Pyramid) 도형 분석 및 직접 만들기 (DIY 가이드)", h1_style))
    story.append(Paragraph("영상 후반부(16~20초)에 자세히 소개된 육각뿔의 제작 과정을 분석하고, 집에서 직접 만들 수 있는 상세 제작 매뉴얼을 제공합니다.", body_style))
    story.append(Spacer(1, 4))

    # 육각뿔 DIY 과정
    story.append(Paragraph("■ 육각뿔 (Hexagonal Pyramid) 3단계 변신 과정", h2_style))
    hex_desc = """
    • <b>구성 면:</b> 정육각형 밑면 1개 + 이등변삼각형 옆면 6개<br/>
    • <b>메커니즘:</b> 펼쳐지면 별 모양(Flower/Star Net)이지만, 6개 삼각형의 꼭짓점 홀을 통과한 끈을 위로 수직 견인하면 6개의 삼각형 모서리가 하나의 뿔 꼭짓점에 모이며 육각뿔로 완성됩니다.
    """
    story.append(Paragraph(hex_desc, body_style))
    hex_img = RLImage('processed_images/comp_hexpyramid_diy.jpg', width=content_w, height=54*mm)
    story.append(hex_img)
    story.append(Paragraph("▲ [화면 캡처] 육각뿔 DIY 과정: [1단계] 꼭짓점 홀에 끈 꿰기 → [2단계] 평면 정렬 → [3단계] 끈을 위로 당겨 육각뿔 팝업 완성", caption_style))
    story.append(Spacer(1, 6))

    # DIY STEP-BY-STEP TABLE
    story.append(Paragraph("■ 집에서 만드는 '당기는 전개도 교구' 4단계 제작 매뉴얼", h2_style))
    
    diy_table_data = [
        [
            Paragraph("<b>단계</b>", ParagraphStyle('th1', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9)),
            Paragraph("<b>작업 내용 및 핵심 가이드</b>", ParagraphStyle('th2', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9)),
            Paragraph("<b>준비물 / 주의사항</b>", ParagraphStyle('th3', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9))
        ],
        [
            Paragraph("<b>STEP 1<br/>도안 작도</b>", ParagraphStyle('td1', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("원하는 입체도형의 전개도를 두꺼운 도화지에 그립니다. 칼이나 가위로 외곽선을 깔끔하게 오려냅니다.", body_style),
            Paragraph("• 도화지(180~220g)<br/>• 자, 연필, 가위", caption_style)
        ],
        [
            Paragraph("<b>STEP 2<br/>접는 선 칼선</b>", ParagraphStyle('td2', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("접히는 모든 모서리 안쪽에 <b>칼등이나 잉크 다 쓴 볼펜</b>으로 살짝 눌러 자국(Crease Line)을 냅니다. 선이 매끄러워야 줄을 당길 때 저항 없이 반듯하게 일어납니다.", body_style),
            Paragraph("• 칼등, 송곳<br/>• <b>주의:</b> 종이가 잘리지 않게 힘 조절", caption_style)
        ],
        [
            Paragraph("<b>STEP 3<br/>타공 (펀칭)</b>", ParagraphStyle('td3', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("전개도 꼭짓점 또는 맞닿는 날개 끝에서 <b>약 5~8mm 안쪽</b>에 1구 펀치(지름 3~5mm)로 구멍을 뚫습니다. 구멍이 너무 바깥쪽이면 줄을 당길 때 찢어질 수 있습니다.", body_style),
            Paragraph("• 1구 펀치 또는 타공기<br/>• 필요 시 스티커로 홀 보강", caption_style)
        ],
        [
            Paragraph("<b>STEP 4<br/>실 꿰기 & 완성</b>", ParagraphStyle('td4', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("마찰이 적고 튼튼한 면 끈이나 털실을 도안 홀에 순서대로 꿰어줍니다. 끈 끝부분에 종이 조각을 덧대어 <b>'PULL' 손잡이</b>를 만들면 당기기 수월합니다.", body_style),
            Paragraph("• 털실/지끈/면끈<br/>• 마스킹 테이프", caption_style)
        ]
    ]

    diy_table = Table(diy_table_data, colWidths=[24*mm, 105*mm, 45*mm])
    diy_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F766E')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(diy_table)
    story.append(PageBreak())

    # ==========================================
    # PAGE 5: 교육적 효과 및 가정/학교 연계 학습법
    # ==========================================
    story.append(Paragraph("4. 교육적 가치 및 가정·수업 연계 활용법", h1_style))
    story.append(Paragraph("단순한 만들기 놀이를 넘어 초등 수학 교과 역량을 획기적으로 신장시키는 지도 방안을 정리했습니다.", body_style))
    story.append(Spacer(1, 6))

    # 초등 교과 연계표
    story.append(Paragraph("■ 초등학교 수학과 교육과정 연계표", h2_style))
    curr_data = [
        [
            Paragraph("<b>학년/학기</b>", ParagraphStyle('c1', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9)),
            Paragraph("<b>단원명</b>", ParagraphStyle('c2', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9)),
            Paragraph("<b>핵심 성취 기준 및 교구 연계 학습 내용</b>", ParagraphStyle('c3', fontName='MalgunBold', alignment=1, textColor=colors.white, fontSize=9))
        ],
        [
            Paragraph("초등 5학년<br/>2학기", ParagraphStyle('c4', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("5. 직육면체", ParagraphStyle('c5', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("• 직육면체와 정육면체의 성질, 밑면과 옆면의 수직/평행 관계 이해<br/>• 전개도를 접었을 때 마주보는 면과 만나는 모서리를 교구로 직접 확인", body_style)
        ],
        [
            Paragraph("초등 6학년<br/>1학기", ParagraphStyle('c6', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("2. 각기둥과<br/>각뿔", ParagraphStyle('c7', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("• 삼각기둥, 육각기둥, 육각뿔 등의 밑면 모양에 따른 도형 분류<br/>• 꼭짓점, 면, 모서리 개수의 변화 규칙을 평면과 입체 상태에서 동시 관찰", body_style)
        ],
        [
            Paragraph("초등 6학년<br/>2학기", ParagraphStyle('c8', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("6. 원기둥, 원뿔,<br/>구", ParagraphStyle('c9', fontName='MalgunBold', alignment=1, fontSize=8.5)),
            Paragraph("• 원기둥의 옆면 직사각형이 곡면으로 말려 들어가는 과정 체득<br/>• 밑면 원의 둘레(원주 = 2πr)와 옆면 가로 길이가 일치해야 함을 실측 증명", body_style)
        ]
    ]
    curr_table = Table(curr_data, colWidths=[24*mm, 32*mm, 118*mm])
    curr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(curr_table)
    story.append(Spacer(1, 10))

    # 4가지 추천 놀이 활동
    story.append(Paragraph("■ 부모님과 선생님을 위한 4가지 추천 놀이 활동", h2_style))
    activities_html = """
    <b>활동 1. [스피드 전개도 맞히기 퀴즈]</b><br/>
    바닥에 전개도를 펼쳐둔 상태에서 아이에게 "이 끈을 당기면 어떤 모양의 상자가 될까?" 질문하여 머릿속으로 입체 모양을 상상(심상화)하게 한 뒤, 줄을 당겨 정답을 확인합니다.<br/>
    <br/>
    <b>활동 2. [만나는 모서리 & 꼭짓점 짝짓기]</b><br/>
    평면 전개도 상태에서 서로 맞닿을 모서리와 꼭짓점에 같은 색깔 스티커나 기호를 표시하게 합니다. 줄을 당겼을 때 실제로 두 점과 선이 정확히 만나는지 검증합니다.<br/>
    <br/>
    <b>활동 3. [오답 전개도 실험실]</b><br/>
    접었을 때 면이 겹치거나 뚜껑이 닫히지 않는 '잘못된 전개도'를 의도적으로 만들어 줄을 당겨봅니다. 왜 입체가 완성되지 않는지 아이 스스로 오류를 발견하게 합니다.<br/>
    <br/>
    <b>활동 4. [나만의 창의 입체도형 만들기]</b><br/>
    기본 사각기둥, 삼각뿔 외에 오각기둥, 정팔면체 등 새로운 다면체 도안을 설계하여 끈을 꿰어보는 확장 창작 프로젝트로 연결합니다.
    """
    act_p = Paragraph(activities_html, body_style)
    act_box = Table([[act_p]], colWidths=[content_w])
    act_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(act_box)
    story.append(Spacer(1, 10))

    # Final Closing Summary Card
    closing_html = """
    <b>[종합 총평]</b><br/>
    수학은 기호와 공식을 외우는 과목이 아니라 주변의 공간과 규칙을 탐구하는 학문입니다. 본 영상에서 소개된 '당기는 입체도형 전개도 교구'는 평면과 입체의 경계를 무너뜨려 아이들에게 수학의 시각적 즐거움과 성취감을 선물하는 최고의 교구입니다.
    """
    closing_p = Paragraph(closing_html, ParagraphStyle('close', fontName='Malgun', fontSize=8.8, leading=13, textColor=colors.HexColor('#0F766E')))
    closing_box = Table([[closing_p]], colWidths=[content_w])
    closing_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0FDF4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#86EFAC')),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(closing_box)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {pdf_filename}")

if __name__ == '__main__':
    create_manual()
