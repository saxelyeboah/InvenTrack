InvenTrack SRS & System Design — CSCD602 

# **SOFTWARE REQUIREMENTS SPECIFICATION AND SYSTEM DESIGN DOCUMENT** 

## **InvenTrack** 

_A Lightweight Inventory Management System for Small Retail Businesses_ 

Prepared for: CSCD602 – Advanced Software Engineering University of Ghana, Department of Computer Science 48-Hour Independent Software Engineering Project 

Document Version: 1.0 Status: Draft for Development Prepared by: [Student Name] — [Index Number] 

Page 1 of 26 

InvenTrack SRS & System Design — CSCD602 

**Table of Contents** 

Page 2 of 26 

InvenTrack SRS & System Design — CSCD602 

### **1. Introduction** 

#### **1.1 Purpose** 

This combined Software Requirements Specification (SRS) and System Design Document defines the functional and non-functional requirements, requirements prioritisation, software effort estimation, and core system design artefacts for InvenTrack, a lightweight, web-based inventory management system for a single-branch small retail business. It is prepared as the requirements-engineering and system-design deliverable of a 48-hour independent Advanced Software Engineering (CSCD602) project and is intended to guide implementation, testing, and deployment decisions within that fixed time-box. Requirements are covered in Sections 1–7; system design artefacts are covered in Section 8. 

#### **1.2 Document Conventions** 

Functional requirements are identified with the prefix FR-, non-functional requirements with the prefix NFR-, grouped by module/category and numbered sequentially. Each requirement is assigned a MoSCoW priority (Must, Should, Could, Won't — see Section 5). The keyword “shall” indicates a binding requirement; “should” is reserved for MoSCoW labelling only, not requirement strength. 

#### **1.3 Intended Audience** 

- The developer (author), as the authoritative reference during design, implementation, and testing. 

- The course instructor/examiner, to assess the application of requirements engineering and effort estimation. 

- Any future maintainer, as the baseline for understanding original scope and prioritisation decisions. 

#### **1.4 Project Scope Summary** 

InvenTrack allows a small shop owner and their staff to record products, track stock received and issued, be alerted to low stock, record simplified sales, and view basic reports — replacing an error-prone paper-based stock book. The full in-scope/out-of-scope breakdown for the 48-hour build is detailed in Section 7. 

#### **1.5 Definitions, Acronyms and Abbreviations** 

|**Term**|**Defniton**|
|---|---|
|SRS|Sofware Requirements Specifcaton|
|MVP|Minimum Viable Product — the smallest feature set that delivers usable value|
|FR / NFR|Functonal Requirement / Non-Functonal Requirement|
|SKU|Stock Keeping Unit — a unique product identfer code|
|MoSCoW|Prioritsaton technique: Must have, Should have, Could have, Won't have|
|PERT|Program Evaluaton and Review Technique — three-point efort estmaton|
|COCOMO|Constructve Cost Model — an algorithmic sofware efort estmaton model|
|KLOC|Thousand (Kilo) Lines of Code|
|WBS|Work Breakdown Structure|
|RTM|Requirements Traceability Matrix|
|RBAC|Role-Based Access Control|



Page 3 of 26 

InvenTrack SRS & System Design — CSCD602 

#### **1.6 References** 

- Mensah, S. (2026). CSCD602 Advanced Software Engineering, Sessions 1–6 (Introduction to Software Engineering; Requirements Engineering; Technical Debt; Program Evolution Dynamics; Software Design & Architecture; Software Effort Estimation). University of Ghana. 

- IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications (structural reference). 

- Boehm, B. (1981). Software Engineering Economics — origin of the COCOMO model. 

- Fowler, M. — Technical Debt Quadrant. 

- Lehman, M. & Belady, L. — Laws of Software Evolution. 

- Government of Ghana. Data Protection Act, 2012 (Act 843). 

- W3C — Web Content Accessibility Guidelines (WCAG) 2.2. 

Page 4 of 26 

InvenTrack SRS & System Design — CSCD602 

### **2. Overall Description** 

#### **2.1 Problem Statement** 

Small, single-branch retail businesses in contexts such as Ghana's informal and semi-formal retail sector commonly track inventory using a paper exercise book or, at best, a spreadsheet maintained inconsistently. This causes three recurring problems: (1) stock counts drift from reality because entries are missed during busy periods, leading to stock-outs of fast-moving items and lost sales; (2) owners cannot see, at a glance, which items are low, tying up cash in slow-moving stock while high-demand items run out; and (3) there is no audit trail of who changed what stock and when, making shrinkage and error difficult to trace. InvenTrack addresses this by providing a simple, role-aware, web-based system that records every stock movement, automatically maintains accurate stock levels, and proactively flags low stock — without the cost or complexity of a full point-of-sale or enterprise resource planning (ERP) system. 

#### **2.2 Product Perspective** 

InvenTrack is a new, standalone web application; it does not replace or integrate with any existing system in this 48-hour iteration. It is accessed through a standard web browser and is deployed as a single, layered application (presentation, business logic, and data access layers — see Session 5 course content on Layered/N-Tier Architecture) backed by a relational database. Detailed architectural, use-case, class, and entity-relationship diagrams are produced as part of the Design deliverable that follows this SRS; this document focuses on what the system must do, not how it is built internally, though Section 7.3 gives a brief technical-approach note for planning purposes. 

#### **2.3 Stakeholder and User Analysis** 

Requirements Engineering course content (Session 2) distinguishes business, stakeholder, functional, nonfunctional, and constraint-level requirements, and stresses that RE spans the full lifecycle from elicitation to management. The stakeholders identified for InvenTrack are: 

|**Stakeholder**|**Interest / Need**|**Infuence**|
|---|---|---|
|Business Owner / Admin|Owns the shop; needs accurate, real-tme visibility of stock value,<br>sales, and low-stock risk to make purchasing and pricing decisions.|High|
|Inventory Clerk / Sales Staf|Performs day-to-day stock-in, stock-out, and sales recording; needs a<br>fast, low-fricton interface usable with minimal training.|High|
|Suppliers (indirect)|Provide stock; referenced in supplier and stock-in records though they<br>do not use the system directly.|Low|
|Customers (indirect)|Beneft from fewer stock-outs and accurate pricing; do not interact<br>with the system directly in this MVP.|Low|
|Course Instructor / Examiner|Evaluates the project against the CSCD602 Advanced Sofware<br>Engineering rubric: requirements engineering, estmaton, design,<br>technical debt management, testng, deployment, and documentaton.|High|
|Developer (Author)|Solo student developer responsible for independently analysing,<br>designing, implementng, testng, deploying, and documentng the<br>system within the 48-hour window.|High|



_Table 1: Stakeholder analysis._ 

Two primary personas were developed, consistent with the User-Centred Design practice covered in Session 5, to keep requirements grounded in real user goals rather than assumptions: 

**Ama Boateng — Shop Owner / Admin** 

Page 5 of 26 

InvenTrack SRS & System Design — CSCD602 

- Age 41, runs a household-goods retail shop with 2 staff. 

- Goal: know at a glance what is running low, what is selling, and how much stock is worth. 

- Frustration: currently uses a paper exercise book; stock counts are often wrong and she over-orders or runs out unexpectedly. 

- Tech comfort: moderate — uses WhatsApp and mobile money daily, but is impatient with complicated menus. 

###### **Kofi Mensah — Inventory Clerk** 

- Age 24, receives deliveries, restocks shelves, and records sales at the counter. 

- Goal: record a stock movement or sale in under a minute, without needing to ask for help. 

- Frustration: forgets to update the paper book when the shop is busy, leading to stock discrepancies. 

- Tech comfort: comfortable with smartphones; prefers large buttons and minimal typing. 

#### **2.4 Requirements Elicitation Approach** 

As a solo, time-boxed academic project without direct access to a live shop for extended fieldwork, elicitation combined several techniques introduced in Session 2 rather than relying on a single method, in order to reduce the risk of tacit or misunderstood requirements: 

- Expert judgement / domain analysis — the developer's own knowledge of small-shop retail operations in the Ghanaian context, supplemented by informal, semi-structured conversations with a small-shop operator to validate assumptions about daily stock-keeping pain points. 

- Benchmarking — review of comparable lightweight inventory tools to identify a realistic, achievable feature baseline rather than reinventing the category. 

- Low-fidelity prototyping — quick paper/wireframe sketches of the core screens (dashboard, stock-in form, product list) used to validate the requirements in this document before implementation begins, consistent with the course's guidance that prototypes “uncover missing or misunderstood requirements” and enable “early validation.” 

- Requirements analysis & negotiation — the initial requirement list was deliberately over-scoped, then negotiated down against the 48-hour effort ceiling using MoSCoW prioritisation (Section 5) and the effort estimate (Section 6). 

#### **2.5 Assumptions and Dependencies** 

- A single developer builds, tests, and deploys the system independently within the 48-hour window, optionally using AI-assistive tools for boilerplate generation, as permitted by the assignment brief. 

- The developer has working familiarity with the chosen web framework, database, and hosting platform; no time is budgeted for learning an unfamiliar technology stack from scratch. 

- A modern, common web-application framework and a managed relational database (e.g., PostgreSQL/SQLite) are used, allowing significant reuse of framework-provided authentication, routing, and ORM functionality rather than building these from first principles. 

- Free-tier cloud hosting (e.g., Render, Vercel, or Netlify) is available and sufficient for demonstration purposes; production-grade capacity planning is out of scope. 

- Initial data volumes are small (tens to low hundreds of products, a handful of concurrent users), consistent with a single small shop. 

- No integration with external accounting, POS hardware, or payment systems is required for this iteration. 

Page 6 of 26 

InvenTrack SRS & System Design — CSCD602 

#### **2.6 Constraints** 

- Hard deadline: all analysis, design, implementation, testing, deployment, and documentation must be completed within 48 hours. 

- Single-developer team: no parallel work-streams; all estimation and scoping must account for strictly sequential effort. 

- No dedicated budget: only free/open-source tools and free-tier hosting may be used. 

- Academic deliverable constraints: the project must explicitly demonstrate requirements engineering, effort estimation, design, technical debt management, testing, deployment, documentation, and future-evolution thinking, not just working code. 

- Must comply, at a basic level, with the access-control and data-minimisation expectations of Ghana's Data Protection Act, 2012 (Act 843). 

Page 7 of 26 

InvenTrack SRS & System Design — CSCD602 

### **3. Functional Requirements** 

Functional requirements describe what the system must do and were derived from the stakeholder needs in Section 2.3. Each is labelled with a MoSCoW priority; the rationale for prioritisation is given in Section 5. 

##### **_3.1 User Authentication & Access Control_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-1.1**|The system shall allow a registered user to log in using a unique username/email and<br>password.|**Must**|
|**FR-1.2**|The system shall enforce role-based access control distnguishing an “Admin” role from a<br>“Staf/Inventory Clerk” role.|**Must**|
|**FR-1.3**|The system shall allow an Admin to create, edit, deactvate, and delete staf user accounts.|**Must**|
|**FR-1.4**|The system shall automatcally end a user's session afer a period of inactvity.|**Should**|
|**FR-1.5**|The system shall allow a user to reset a forgoten password through a secure mechanism.|**Could**|



##### **_3.2 Product & Category Management_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-2.1**|The system shall allow an authorized user to add a new product with atributes: name,<br>SKU/code, category, unit of measure, cost price, selling price, and reorder level.|**Must**|
|**FR-2.2**|The system shall allow an authorized user to edit the details of an existng product.|**Must**|
|**FR-2.3**|The system shall allow an authorized user to deactvate (sof-delete) a product without<br>losing its historical stock records.|**Must**|
|**FR-2.4**|The system shall allow an authorized user to create and manage product categories.|**Should**|
|**FR-2.5**|The system shall prevent duplicate SKU/product codes from being created.|**Must**|
|**FR-2.6**|The system shall allow a user to search and flter products by name, SKU, or category.|**Must**|



##### **_3.3 Stock Movement Management_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-3.1**|The system shall allow an authorized user to record stock received (“Stock In”) against a<br>product and, optonally, a supplier, increasing the product's on-hand quantty.|**Must**|
|**FR-3.2**|The system shall allow an authorized user to record stock issued or removed (“Stock Out”)<br>for reasons such as damage or transfer, decreasing on-hand quantty.|**Must**|
|**FR-3.3**|The system shall allow an authorized user to record a manual stock adjustment together<br>with a reason/note (e.g., a stock-count correcton).|**Should**|
|**FR-3.4**|The system shall automatcally recalculate and persist the current stock level immediately<br>afer every stock movement transacton.|**Must**|
|**FR-3.5**|The system shall maintain a chronological, non-editable audit log of all stock movements,<br>recording who performed the acton, what changed, when, and why.|**Must**|
|**FR-3.6**|The system shall prevent a Stock Out transacton that would result in a negatve stock<br>balance, unless explicitly overridden by an Admin.|**Should**|



##### **_3.4 Low-Stock Alerting & Dashboard_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-4.1**|The system shall automatcally fag a product as “Low Stock” when its on-hand quantty falls<br>at or below its confgured reorder level.|**Must**|
|**FR-4.2**|The system shall display a summary dashboard on login showing total actve products, total|**Must**|



Page 8 of 26 

InvenTrack SRS & System Design — CSCD602 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
||stock value, and a list of low-stock/out-of-stock items.||
|**FR-4.3**|The system shall allow a user to view a dedicated Low-Stock report listng all currently<br>fagged items.|**Should**|
|**FR-4.4**|The system shall send an in-app or email notfcaton to the Admin when a product newly<br>becomes low-stock.|**Could**|
|**_3.5 Supp_**|**_lier Management_**||



|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-5.1**|The system shall allow an authorized user to add, edit, and view supplier records (name,<br>contact person, phone, email).|**Should**|
|**FR-5.2**|The system shall allow a Stock In transacton to be associated with a registered supplier.|**Should**|
|**FR-5.3**|The system shall allow a user to view all stock received from a specifc supplier over a given<br>period.|**Could**|



##### **_3.6 Simplified Sales Recording_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**FR-6.1**|The system shall allow an authorized user to record a sale transacton consistng of one or<br>more products and quanttes.|**Must**|
|**FR-6.2**|The system shall automatcally deduct sold quanttes from the corresponding product's<br>stock level upon recording a sale.|**Must**|
|**FR-6.3**|The system shall calculate and display the total value of a sale transacton based on selling<br>price.|**Should**|
|**FR-6.4**|The system shall generate a simple on-screen receipt/summary for a completed sale.|**Could**|
|**_3.7 Repo_**<br>**ID**|**_rtng_**<br>**Requirement**|**Priority**|
|**FR-7.1**|The system shall generate a current Stock Level report listng all actve products with on-<br>hand quantty and stock value.|**Must**|
|**FR-7.2**|The system shall generate a Stock Movement History report flterable by date range and/or<br>product.|**Should**|
|**FR-7.3**|The system shall generate a basic Sales report summarising transactons over a selected<br>period.|**Should**|
|**FR-7.4**|The system shall allow reports to be exported (e.g., CSV) or printed.|**Could**|



Page 9 of 26 

InvenTrack SRS & System Design — CSCD602 

### **4. Non-Functional Requirements** 

Non-functional requirements define the quality attributes the system must exhibit. Session 2 course content emphasises that these are “often more critical than functional requirements” because they affect user satisfaction and drive architecture decisions; each requirement below is stated, where possible, as a measurable target rather than a vague quality goal. 

##### **_4.1 Performance_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-1.1**|The system shall respond to a user acton or render a page within 3 seconds under normal<br>load (≤10 concurrent users).|**Must**|
|**NFR-1.2**|A recalculated stock level shall be refected in the UI within 2 seconds of the triggering<br>transacton being submited.|**Must**|
|**_4.2 Securi_**|**_ty_**||
|**ID**|**Requirement**|**Priority**|
|**NFR-2.1**|The system shall store passwords using a one-way salted hash (e.g., bcrypt); passwords shall<br>never be stored or logged in plaintext.|**Must**|
|**NFR-2.2**|The system shall enforce server-side authorizaton so Staf users cannot access Admin-only<br>functons (e.g., user management).|**Must**|
|**NFR-2.3**|All data in transit between client and server shall be encrypted using HTTPS/TLS.|**Must**|
|**NFR-2.4**|The system shall log authentcaton atempts (success/failure) for audit purposes.|**Should**|
|**_4.3 Usabi_**|**_lity_**||



|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-3.1**|A frst-tme Staf user shall be able to complete a Stock-In transacton in under 2 minutes<br>without external training, verifed by a scripted usability test.|**Should**|
|**NFR-3.2**|The user interface shall be responsive and usable on both desktop and common mobile<br>screen widths (≥360px).|**Should**|
|**NFR-3.3**|The system shall present clear, human-readable confrmaton and error messages for every<br>user acton.|**Must**|
|**_4.4 Reliab_**|**_ility & Availability_**||



|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-4.1**|The deployed system shall target at least 95% uptme during the evaluaton period, subject<br>to free-ter hostng limitatons.|**Should**|
|**NFR-4.2**|The system shall not lose a recorded transacton once persisted, even if a subsequent<br>applicaton-level error occurs.|**Must**|
|**_4.5 Maint_**|**_ainability_**||



|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-5.1**|The codebase shall follow a layered/modular architecture (presentaton, business logic, data<br>access) consistent with SOLID design principles, to limit future technical debt.|**Must**|
|**NFR-5.2**|The system shall include a README and inline documentaton sufcient for a new developer<br>to set up the project locally within 30 minutes.|**Should**|



Page 10 of 26 

InvenTrack SRS & System Design — CSCD602 

##### **_4.6 Portability_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-6.1**|The system shall be deployable to a standard cloud PaaS platorm (e.g., Render, Vercel,<br>Netlify) without requiring proprietary infrastructure.|**Must**|
|**NFR-6.2**|The system shall run correctly on the latest two major versions of Chrome, Firefox, and<br>Edge.|**Should**|



##### **_4.7 Data Protection & Compliance_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-7.1**|The system shall restrict access to business data to authentcated, authorized users only,<br>consistent with the data-minimisaton and access-control principles of Ghana's Data<br>Protecton Act, 2012 (Act 843).|**Should**|



##### **_4.8 Scalability_** 

|**ID**|**Requirement**|**Priority**|
|---|---|---|
|**NFR-8.1**|The data model shall support growth to at least 5,000 product records and 50,000 stock-<br>movement records without requiring architectural redesign.|**Could**|



Page 11 of 26 

InvenTrack SRS & System Design — CSCD602 

### **5. Requirements Prioritisation** 

Requirements were prioritised using the MoSCoW technique (Must have / Should have / Could have / Won't have this time), chosen because it is quick to apply without historical velocity data, is easily understood by a nontechnical stakeholder such as a shop owner, and maps cleanly onto a hard time-box: “Must” items define the minimum viable product (MVP) that has to work for the system to be usable at all within 48 hours, while “Should” and “Could” items are added only if the effort estimate in Section 6 leaves spare capacity. 

|**Priority**|**Meaning**|**Count**<br>**(FR+NFR)**|
|---|---|---|
|**Must**|Required for the system to be minimally usable and to satsfy the core<br>problem statement; excluding any of these invalidates the MVP.|26|
|**Should**|Important and adds real value, but the system remains usable without it in the<br>frst release.|17|
|**Could**|Desirable if tme permits afer all Must and Should items are complete and<br>tested.|6|
|**Won't (this**<br>**iteraton)**|Explicitly deferred to future evoluton — see Secton 7.2.|—|



_Table: MoSCoW distribution across all functional and non-functional requirements._ 

Prioritisation criteria applied when assigning MoSCoW labels: 

- Direct link to the problem statement — does the requirement stop stock-outs, stock inaccuracy, or loss of audit trail? (favours Must) 

- Dependency — do other Must requirements depend on this one functioning first? (e.g., stock recalculation, FR-3.4, is Must because low-stock alerting, sales deduction, and reporting all depend on it) 

- Estimated effort relative to value — low-effort, high-value items were pulled up; high-effort, low-value items (e.g., automated email alerting, FR-4.4) were pushed down. 

- Testability within the time-box — requirements that would require extensive test scaffolding to verify safely were deferred unless core to the problem. 

Page 12 of 26 

InvenTrack SRS & System Design — CSCD602 

### **6. Software Effort Estimation** 

#### **6.1 Technique Selection and Justification** 

Two complementary techniques from Session 6 (Software Effort Estimation) were applied and triangulated, following the course's own best-practice guidance to “use multiple techniques and compare.” 

- Primary technique — Work Breakdown Structure (WBS) with Three-Point (PERT) Estimation, driven by expert judgement. This was selected as primary because: (a) expert judgement is explicitly recommended in the course content for a project that is “novel” and where “historical data is limited” — both true for a solo, one-off academic build; (b) bottom-up, WBS-based estimation is described as “more accurate and defensible” than top-down estimation because it forces the work to be broken into small, estimable tasks; and (c) a 48-hour hard deadline requires effort to be planned in hours, not the person-months granularity that algorithmic models such as COCOMO natively produce. 

- Secondary technique (cross-check) — COCOMO Basic Model (Organic mode), applied to an estimated code size in KLOC, used purely as an independent sanity check on the order of magnitude of the WBS estimate, as required by the course's “triangulation” best practice. 

#### **6.2 Primary Estimate: WBS with Three-Point (PERT) Estimation** 

The project scope was decomposed into thirteen estimable tasks spanning every phase the assignment requires (requirements, design, implementation by module, testing, deployment, and documentation). For each task, Optimistic (O), Most Likely (M), and Pessimistic (P) effort in hours were estimated by expert judgement, and the PERT expected value was computed as E = (O + 4M + P) / 6, exactly as defined in the course content. 

|**Task (WBS item)**|**O (h)**|**M (h)**|**P (h)**|**PERT E (h)**|
|---|---|---|---|---|
|Requirements engineering (problem defniton, stakeholder<br>analysis, elicitaton, SRS authoring, prioritsaton, efort<br>estmaton)|3|4|6|**4.17**|
|System & UI design (architecture outline, ER model, low-<br>fdelity wireframes, use-case/class sketches)|2|3|5|**3.17**|
|Environment & project set-up (repo, framework scafold,<br>database, base deployment pipeline)|1|1.5|2.5|**1.58**|
|Implementaton – authentcaton & role-based access|2|3|4.5|**3.08**|
|Implementaton – product & category management (CRUD)|2.5|3.5|5|**3.58**|
|Implementaton – stock movement engine<br>(stock-in/out/adjust + recalculaton)|3|4.5|6.5|**4.58**|
|Implementaton – low-stock alerts & dashboard|1.5|2.5|4|**2.58**|
|Implementaton – supplier management|1|1.5|2.5|**1.58**|
|Implementaton – simplifed sales recording|1.5|2.5|4|**2.58**|
|Implementaton – reportng module|1.5|2.5|4|**2.58**|
|Testng (unit, integraton, system, UAT)|3|4.5|7|**4.67**|
|Deployment (hostng set-up, environment confg, seed data,<br>smoke test)|1|1.5|2.5|**1.58**|
|Documentaton (README, user guide, test report, technical-<br>debt log)|1.5|2|3|**2.08**|
|**Total**||**36.5**||**37.81**|



_Table: Work Breakdown Structure with three-point (PERT) effort estimation. E = (O + 4M + P) / 6._ 

Page 13 of 26 

InvenTrack SRS & System Design — CSCD602 

The PERT-weighted base estimate totals approximately 37.8 person-hours. Because the course content (Session 6) identifies the “Cone of Uncertainty” and shows that even at the “Requirements Defined” stage an estimate can still vary by roughly 0.5× to 2×, a contingency buffer of approximately 10.2 hours (≈ 27%) is reserved against the 48-hour ceiling for integration friction, environment issues, and re-work discovered during testing. This yields a planned effort budget of 48 person-hours — i.e., the estimate is deliberately calibrated to consume the full timebox, with the buffer explicitly reserved rather than left implicit. 

#### **6.3 Estimated Duration and Team Composition** 

|**Parameter**|**Value**|
|---|---|
|Team size|1 (solo student developer)|
|Base efort estmate (PERT)|≈ 37.8 person-hours|
|Contngency bufer|≈ 10.2 person-hours (≈ 27%)|
|Planned efort budget|48 person-hours (matches the assignment ceiling)|
|Calendar duraton|48 consecutve hours (2 days), with actve work concentrated in blocks and<br>tme reserved for rest and breaks|
|Notonal cost (illustratve only)|At a notonal junior-developer rate of GHS 60/hour: ≈ 37.8h × GHS 60 ≈<br>GHS 2,268 (excludes hostng/tooling; not a real billing fgure, shown only<br>to demonstrate the Efort × Rate = Cost relatonship from Session 6)|



#### **6.4 Cross-Check: COCOMO Basic Model** 

As an independent triangulation check, the COCOMO Basic model (Organic mode, appropriate for a small, familiar, flexible-requirements project: a = 2.4, b = 1.05) was applied to a rough size estimate of 1.3 KLOC for the MVP feature set: 

- Effort (PM) = a × (KLOC)^b = 2.4 × (1.3)^1.05 ≈ 3.16 person-months 

- Converting at ≈152 person-hours per person-month (a common COCOMO-era convention) gives ≈ 480 person-hours — roughly twelve times the WBS/PERT estimate. 

This large gap is expected and instructive rather than a sign of a flawed estimate: COCOMO's coefficients were calibrated on 1970s–80s industrial projects that assumed limited code reuse, heavier process overhead, and fulltime teams with management layers — none of which apply to a solo developer building a small MVP on a modern framework with substantial reuse of built-in authentication, ORM, and UI-component functionality (and, per the assignment brief, optional AI-assistive tooling). COCOMO is therefore retained only as an order-ofmagnitude sanity check confirming that InvenTrack is, in absolute terms, a “small” system (low single-digit person-months, not person-years) rather than as the authoritative figure. The WBS/PERT estimate in Section 6.2, grounded in this project's actual task breakdown, is used to drive scoping decisions. 

#### **6.5 Assumptions and Constraints Underlying the Estimate** 

- A single, moderately experienced developer performs all analysis, design, implementation, testing, and deployment tasks sequentially. 

- Estimates assume reuse of a mainstream web framework's built-in authentication, routing, and ORM/database-access features rather than building these subsystems from scratch. 

- Estimates exclude time spent learning an unfamiliar technology from zero; a stack the developer already has working knowledge of is assumed. 

Page 14 of 26 

InvenTrack SRS & System Design — CSCD602 

- Testing effort (4.5h most-likely) assumes targeted unit/integration tests on core logic (stock recalculation, authentication, low-stock flagging) plus manual system/UAT test scripts, not exhaustive automated coverage. 

- The 48-hour window is treated as the hard constraint; any task discovered mid-project to exceed its Pessimistic estimate triggers an immediate re-scoping decision (moving a Should/Could item to Won't) rather than exceeding the deadline. 

#### **6.6 How the Estimate Shaped Project Scope** 

The WBS/PERT estimate directly drove the MoSCoW prioritisation in Section 5 and the scope decisions in Section 7. Specifically: (1) the base estimate of ≈ 38 hours left only ≈ 10 hours of contingency inside the 48-hour ceiling, which was judged too tight to safely also build higher-effort, lower-value features such as a full point-of-sale checkout, multi-branch support, or barcode scanning — these were therefore assigned “Won't have this iteration” rather than “Could have”; (2) within the estimate, testing and deployment were deliberately protected as non-negotiable Must-do WBS line items (rather than being the first casualties of time pressure), because the assignment rubric requires demonstrable testing and a live deployment; and (3) features whose PERT estimate individually exceeded roughly 4 hours were re-examined for simplification (for example, sales recording, FR-6.x, was simplified to a basic multi-line transaction rather than a full checkout flow with discounts and tax) so that no single task jeopardised the overall budget. 

Page 15 of 26 

InvenTrack SRS & System Design — CSCD602 

### **7. System Scope for the 48-Hour Build** 

#### **7.1 In-Scope (MVP) Features** 

The system to be built within the 48-hour window comprises all requirements labelled Must in Sections 3 and 4, plus Should/Could items only if the effort tracked in Section 6 remains within budget as implementation proceeds: 

- Secure login with Admin and Staff roles (FR-1.1–FR-1.3). 

- Product and category management with duplicate-SKU prevention and search (FR-2.1–FR-2.3, FR-2.5– FR-2.6). 

- Stock-in, stock-out, automatic stock recalculation, and an audit log of movements (FR-3.1–FR-3.2, FR-3.4– FR-3.5). 

- Automatic low-stock flagging and a summary dashboard (FR-4.1–FR-4.2). 

- Simplified sales recording with automatic stock deduction (FR-6.1–FR-6.2). 

- A current stock-level report (FR-7.1). 

- The security, performance, and maintainability Must non-functional requirements in Section 4. 

#### **7.2 Out-of-Scope / Deferred Features (“Won't Have” — Future Evolution)** 

The following are explicitly excluded from the 48-hour build. They are not omissions but deliberate, estimationdriven scope decisions (Section 6.6), and are carried forward as the starting backlog for future software evolution, consistent with Lehman's First Law of Continuing Change covered in Session 4 (a system must keep adapting to remain satisfying to its users): 

- Full point-of-sale checkout with tax, discounts, and hardware receipt printing. 

- Multi-branch / multi-warehouse support. 

- Barcode/QR code scanning integration. 

- Automated purchase-order workflows to suppliers. 

- Email/SMS notification integrations (an in-app low-stock indicator is provided instead in this iteration). 

- Offline mode / installable Progressive Web App (PWA) support. 

- Multi-currency support. 

- Advanced analytics, forecasting, or business-intelligence dashboards. 

- Third-party accounting-system integration. 

- Self-service password reset via email (FR-1.5). 

- Concurrency conflict-resolution beyond basic database transactions (acceptable for the expected singledigit concurrent-user load of one small shop). 

#### **7.3 High-Level Technical Approach (for planning purposes)** 

InvenTrack is planned as a single web application using a mainstream full-stack JavaScript/TypeScript framework with server-rendered or API-backed pages, a relational database (e.g., PostgreSQL, with SQLite acceptable for local development), and password hashing via bcrypt or equivalent. The codebase is organised into presentation, business-logic, and data-access layers (Session 5's Layered/N-Tier Architecture), so that the stock-recalculation and low-stock rules are isolated from the UI and can be unit-tested independently. Deployment targets a free-tier cloud PaaS platform (e.g., Render, Vercel, or Netlify) so that a live URL can be provided to the examiner, 

Page 16 of 26 

InvenTrack SRS & System Design — CSCD602 

consistent with the assignment's deployment requirement. Section 8 below develops this into concrete design artefacts. 

Page 17 of 26 

InvenTrack SRS & System Design — CSCD602 

### **8. System Design** 

This section develops appropriate design artefacts, produced alongside implementation, that translate the requirements above into a buildable design. Per the assignment brief's own guidance — “you do not need to produce every possible diagram; select the diagrams that best communicate your system” — three diagrams were deliberately selected rather than exhaustively produced, given the 48-hour budget established in Section 6. 

#### **8.1 Diagram Selection Rationale** 

|**Diagram Type**|**Included?**|**Reason**|
|---|---|---|
|System architecture|**Yes**|Communicates the layered structure (presentaton / business logic / data<br>access) required by NFR-5.1, and the deployment target required by NFR-6.1<br>— the single clearest picture of how the whole system fts together.|
|Use-case diagram|**Yes**|Gives an at-a-glance view of functonal scope and which role (Admin/Staf) can<br>perform which of the FRs in Secton 3 — the clearest picture of what the<br>system does.|
|ER / database<br>diagram|**Yes**|InvenTrack is a data-centric system; the schema is the foundaton every<br>module (stock, sales, suppliers) is built on — the clearest picture of the data<br>the system manages.|
|Class diagram|No|The enttes and relatonships needed to communicate the domain model are<br>already conveyed by the ER diagram (Secton 8.4); a separate object-oriented<br>view was judged non-essental in a deliberately minimal three-diagram set.|
|Sequence diagram(s)|No|The core transactonal logic (stock recalculaton on Stock-In/Sale) is fully<br>specifed narratvely via FR-3.1–FR-3.6 and FR-6.1–FR-6.2 (Secton 3); omited<br>here to keep the diagram set minimal, and can be produced during<br>implementaton if needed.|
|Actvity diagram|No|The negatve-stock and low-stock decision rules are already fully specifed as<br>FR-3.6 and FR-4.1 (Secton 3); a dedicated diagram was judged non-essental<br>for a minimal set.|
|UI wireframes|No|Screen-level layout is deferred to the implementaton/prototyping phase; not<br>essental to communicatng system structure, data, and functonal scope at<br>this stage.|
|Component diagram|No|Would largely restate the layer boundaries already shown in the System<br>Architecture diagram (Secton 8.2).|
|Data-fow diagram|No|Overlaps with the System Architecture diagram's data-fow arrows (UI →<br>Presentaton → Business Logic → Data Access → Database).|



#### **8.2 System Architecture** 

InvenTrack follows a Layered (N-Tier) Architecture (Session 5) so that the stock-recalculation and low-stock business rules are isolated from both the UI and the database technology — directly satisfying NFR-5.1 (maintainability) and limiting the “architecture/design debt” category flagged in Session 3. The Presentation layer exposes routes/controllers; the Business Logic layer holds services such as InventoryService and SalesService; the Data Access layer implements the Repository pattern (interfaces such as IProductRepository, IStockRepository) so the underlying database can change without touching business logic above it — an application of the SOLID Dependency Inversion Principle. The application is deployed as a single unit to a free-tier cloud PaaS platform to satisfy the assignment's live-deployment requirement (NFR-6.1). 

Page 18 of 26 



<!-- Start of picture text -->
Web UI (Responsive<br>HTML/CSS/JS)<br>Used by Admin & Staff via<br>Browser<br>HTTPS/ TLS<br>InvenTrack Application Server<br>Presentation Layer<br>Routes / Controllers / REST<br>API endpoints<br>deployed on<br>Business Logic Layer RSS SSSeaeeRese asee eae<br>AuthService, Cloud PaaS Hosting }<br>InventoryService, 1 Rend/ V e rcelr / Netlify (free<br>SalesService, tier)<br>LowStockEngine beeen!<br>Data Access Layer<br>Repository Pattern:<br>|ProductRepository,<br>IStockRepository,<br>|SupplierRepository<br>SQL via ORM<br>Relational Database<br>PostgreSQL (prod) / SQLite<br>(dev)<br><!-- End of picture text -->



<!-- Start of picture text -->
InvenTrack — Use Case Diagram<br>if . am ;<br>f / vA/ ManageStaff Accounts<br>/ | VA<br>// /ff<br>yHal Manage Products&<br>// / }/| — Categories<br>/ ]<br>;<br>@ Admin ; ae<br>—+»{ Manage Suppliers Ss<br>(srentonren)<br>\—<br>Y\\<br>|NN\\ NZSY ; ; View Low-Stock Dashboard<br>|| \\X %<br>Record Stock In include<br>®, Staff at<br>(Inventory Clerk) \x. ;<br>a\Ee ———— RecordAdjustment.Stock Out/5include<br>ie Record Sale } - include<br><!-- End of picture text -->







<!-- Start of picture text -->
USER<br>jee __ i<br>fine fia | ex |<br>classifies records /<br>K<br>PRODUCT<br>fe ! \|<br>f= SALE |<br>Ce fe<br>fie Cd<br>emma || recorded_by_user_id ee [eee performs<br>likeable | | om fom|| [stra | pone |<br>| : a<br>peor iii | |<br>[toon |isasvequantity_on_hand+=o ||| |OKSS | || |<br>N contains supplies<br>\ Co<br>X F O<br>sold.as if aN a/<br>ay)Wainvolved in STOCK_MOVEMENT J]<br>IN SALE_ITEM fe aiid<br>fie [sais | F« jie | performed_by_user_id<br>— [stirg | movemenope | |<br>[oe few<br>| aecmat | unt.pice || =f<br>[aaeime | creaesat | |<br><!-- End of picture text -->

InvenTrack SRS & System Design — CSCD602 

#### **8.6 Design-Level Technical Debt Notes** 

In keeping with Session 3's guidance to track technical debt from the point it is introduced, the following designlevel shortcuts — taken deliberately to fit the 48-hour budget — are flagged here for the project's technical debt log (a separate deliverable) rather than left undocumented: 

- Low-stock notification is limited to an in-app dashboard flag (FR-4.2) rather than the email/SMS notification sketched in FR-4.4 (Could-have, deferred) — classified as Prudent & Deliberate technical debt per the Technical Debt Quadrant (Session 3): a conscious, reversible simplification. 

- The Repository interfaces (IProductRepository, IStockRepository) are defined in the architecture, but, to save implementation time, only one concrete implementation is planned for the 48-hour build — the abstraction is in place (limiting future refactoring cost) even though the “swap the database” benefit is not yet exercised. 

- No caching layer is included in the architecture; acceptable temporarily given the expected data volumes (NFR-8.1) for a single small shop, but flagged for revisit if InvenTrack is scaled to multiple branches (Section 7.2). 

Page 22 of 26 

InvenTrack SRS & System Design — CSCD602 

### **9. Requirements Traceability Matrix (Module Level)** 

The matrix below links each requirement module to its dominant MoSCoW priority, its related WBS effort line, and the primary verification method to be used during testing, supporting the requirements-management practice of traceability emphasised in Session 2. 

|**Module**|**Requirement**<br>**IDs**|**Priority**|**Related WBS Efort Line**|**Verifcaton Method**|
|---|---|---|---|---|
|Authentcaton &<br>Access Control|FR-1.x / NFR-2.x|Must|Implementaton – authentcaton &<br>RBAC (3.08h)|Unit + System + UAT|
|Product & Category<br>Management|FR-2.x|Must|Implementaton – product &<br>category CRUD (3.58h)|Unit + Integraton +<br>UAT|
|Stock Movement<br>Management|FR-3.x|Must|Implementaton – stock movement<br>engine (4.58h)|Unit + Integraton +<br>System|
|Low-Stock Alertng &<br>Dashboard|FR-4.x|Must|Implementaton – alerts &<br>dashboard (2.58h)|Integraton + UAT|
|Supplier<br>Management|FR-5.x|Should|Implementaton – supplier<br>management (1.58h)|Unit + UAT|
|Simplifed Sales<br>Recording|FR-6.x|Must|Implementaton – sales recording<br>(2.58h)|Integraton + System +<br>UAT|
|Reportng|FR-7.x|Must /<br>Should|Implementaton – reportng module<br>(2.58h)|System + UAT|
|Performance,<br>Security, Usability,<br>Reliability,<br>Maintainability,<br>Portability,<br>Compliance,<br>Scalability|NFR-1.x–<br>NFR-8.x|Mostly<br>Must|Cross-cutng — addressed across<br>all implementaton + dedicated<br>Testng (4.67h)|Security, Usability &<br>Performance Testng|



Page 23 of 26 

InvenTrack SRS & System Design — CSCD602 

### **10. Requirements Change Management** 

Even within a 48-hour project, requirements may need to change (for example, if a Must-have task's actual effort exceeds its Pessimistic estimate). Consistent with the formal change-control process introduced in Session 2, any change to a Must-have requirement after implementation has started follows a lightweight version of that process: 

- Change request logging — the change and its reason are noted (even briefly, e.g., in a commit message or short log) rather than made silently. 

- Impact analysis — the developer checks the requirement's entry in the Traceability Matrix (Section 9) to see which WBS effort line and tests are affected. 

- Effort/schedule check — the change is only accepted if it can be absorbed within the remaining contingency buffer (Section 6.2); otherwise a lower-priority requirement is demoted to “Won't have” to compensate, preserving the 48-hour ceiling. 

- Approval — for a solo project the developer acts as their own change-control board, but the decision and rationale are documented for the examiner. 

- Implementation — approved changes are reflected in the code, and, where relevant, in this SRS via a version update (Appendix B). 

Page 24 of 26 

InvenTrack SRS & System Design — CSCD602 

### **11. Acceptance Criteria / Definition of Done** 

A requirement is considered done, for the purposes of this 48-hour build, when all of the following hold: 

- The behaviour matches its “shall” statement exactly, verified by at least one passing test case recorded in the test report (unit, integration, system, or UAT as appropriate — see Section 9). 

- For Must-have functional requirements: the feature is reachable from the deployed, live URL and usable by both the Admin and Staff roles as intended. 

- For non-functional requirements with a measurable target (e.g., NFR-1.1's 3-second response, NFR-3.1's 2- minute task time): the target has been checked, even informally, against the deployed system. 

- Any known limitation or shortcut taken to meet the deadline is recorded in the project's technical debt log (a separate deliverable) rather than left undocumented, consistent with Session 3's guidance to explicitly track technical debt — particularly for any Should/Could item implemented in a simplified form. 

Page 25 of 26 

InvenTrack SRS & System Design — CSCD602 

### **12. Note on Maintenance and Future Evolution** 

A detailed maintenance plan is produced as a separate project deliverable; this SRS records only the forwardlooking implications of the requirements and scope decisions above, per Lehman's Laws of Software Evolution (Session 4). Lehman's First Law (Continuing Change) implies that InvenTrack will need continued adaptation — the “Won't have” backlog in Section 7.2 is the starting point for that evolution. Lehman's Second Law (Increasing Complexity) implies that as features such as multi-branch support or barcode integration are added later, deliberate refactoring effort (not just new features) must be budgeted, echoing the Session 3 guidance that technical debt introduced under the 48-hour constraint — for example, the simplified sales-recording flow (Section 3.6) standing in for a full POS — should be revisited once real usage data is available, rather than accumulating indefinitely. 

Page 26 of 26 

