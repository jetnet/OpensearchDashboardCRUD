# Wiki Architecture Diagram

## Wiki Information Architecture

```mermaid
graph TB
    subgraph "OpenSearch Index Manager Wiki"
        HOME["Home<br/>Welcome & Navigation"]
        
        subgraph "User Guide"
            UG_START["Getting Started"]
            UG_INSTALL["Installation"]
            UG_USAGE["Using the Plugin"]
            UG_CONFIG["Configuration"]
            UG_TIPS["Tips & Tricks"]
            UG_TROUBLE["Troubleshooting"]
        end
        
        subgraph "Developer Guide"
            DG_ARCH["Architecture"]
            DG_START["Getting Started"]
            DG_STRUCTURE["Project Structure"]
            DG_API["API Reference"]
            DG_CONTRIB["Contributing"]
            DG_RELEASE["Release Process"]
        end
        
        subgraph "Reference"
            REF_CONFIG["Configuration Options"]
            REF_TYPES["Field Types"]
            REF_ERRORS["Error Codes"]
            REF_SHORTCUTS["Keyboard Shortcuts"]
        end
        
        subgraph "Other"
            OTHER_FAQ["FAQ"]
            OTHER_CHANGE["Changelog"]
            OTHER_ROADMAP["Roadmap"]
        end
    end
    
    HOME --> UG_START
    HOME --> UG_INSTALL
    HOME --> UG_USAGE
    HOME --> DG_ARCH
    HOME --> DG_API
    HOME --> OTHER_FAQ
    
    UG_START --> UG_INSTALL
    UG_START --> UG_USAGE
    UG_USAGE --> UG_CONFIG
    UG_USAGE --> UG_TIPS
    UG_USAGE --> UG_TROUBLE
    
    DG_START --> DG_STRUCTURE
    DG_START --> DG_API
    DG_START --> DG_CONTRIB
    DG_RELEASE --> DG_CONTRIB
    
    UG_CONFIG --> REF_CONFIG
    UG_USAGE --> REF_TYPES
    UG_TROUBLE --> REF_ERRORS
    UG_TIPS --> REF_SHORTCUTS
```

## Content Flow

```mermaid
flowchart LR
    subgraph "Source"
        README["README.md"]
        USER_GUIDE["docs/user-guide.md"]
        ARCHITECTURE["docs/architecture.md"]
        CONTRIBUTING["CONTRIBUTING.md"]
        CHANGELOG["CHANGELOG.md"]
    end
    
    subgraph "Wiki Pages"
        W_HOME["Home"]
        W_USER["User Guide Pages"]
        W_DEV["Developer Guide Pages"]
        W_REF["Reference Pages"]
        W_CHANGE["Changelog"]
    end
    
    README --> W_HOME
    README --> W_USER
    README --> W_DEV
    
    USER_GUIDE --> W_USER
    USER_GUIDE --> W_REF
    
    ARCHITECTURE --> W_DEV
    
    CONTRIBUTING --> W_DEV
    
    CHANGELOG --> W_CHANGE
```

## Page Detail Level

```mermaid
graph LR
    subgraph "Overview"
        HOME["Home<br/>Level 1"]
        GETTING["Getting Started<br/>Level 1"]
    end
    
    subgraph "How-To"
        INSTALL["Installation<br/>Level 2"]
        USAGE["Using the Plugin<br/>Level 2"]
        CONTRIB["Contributing<br/>Level 2"]
    end
    
    subgraph "Detailed"
        NESTED["Nested Fields<br/>Level 3"]
        API["API Endpoints<br/>Level 3"]
        ERROR["Error Reference<br/>Level 3"]
    end
    
    HOME --> GETTING --> INSTALL --> USAGE --> NESTED
    GETTING --> CONTRIB --> API --> ERROR
```

## Navigation Hierarchy

```mermaid
graph TD
    ROOT["Wiki Root"]
    
    ROOT --> HOME[" /Home " ]
    
    ROOT --> USERGUIDE[" /User-Guide " ]
    USERGUIDE --> UG_GETTING[" /User-Guide/Getting-Started " ]
    USERGUIDE --> UG_INSTALL[" /User-Guide/Installation " ]
    UG_INSTALL --> INST_RELEASE[" .../From-GitHub-Release " ]
    UG_INSTALL --> INST_SOURCE[" .../From-Source " ]
    UG_INSTALL --> INST_DOCKER[" .../Using-Docker " ]
    USERGUIDE --> UG_USING[" /User-Guide/Using-the-Plugin " ]
    UG_USING --> USE_INDEX[" .../Index-Selection " ]
    UG_USING --> USE_DOC[" .../Document-Management " ]
    UG_USING --> USE_NESTED[" .../Nested-Field-Editing " ]
    UG_USING --> USE_SEARCH[" .../Search-Functionality " ]
    UG_USING --> USE_MAPPING[" .../Mapping-Viewer " ]
    
    ROOT --> DEVGUIDE[" /Developer-Guide " ]
    DEVGUIDE --> DEV_ARCH[" /Developer-Guide/Architecture " ]
    DEVGUIDE --> DEV_START[" /Developer-Guide/Getting-Started " ]
    DEVGUIDE --> DEV_STRUCTURE[" /Developer-Guide/Project-Structure " ]
    DEVGUIDE --> DEV_API[" /Developer-Guide/API-Reference " ]
    DEV_API --> API_INDEX[" .../Index-Endpoints " ]
    DEV_API --> API_DOC[" .../Document-Endpoints " ]
    DEV_API --> API_SEARCH[" .../Search-Endpoints " ]
    DEVGUIDE --> DEV_CONTRIB[" /Developer-Guide/Contributing " ]
    DEVGUIDE --> DEV_RELEASE[" /Developer-Guide/Release-Process " ]
    
    ROOT --> REFERENCE[" /Reference " ]
    REFERENCE --> REF_CONFIG[" /Reference/Configuration-Options " ]
    REFERENCE --> REF_TYPES[" /Reference/Field-Types " ]
    REFERENCE --> REF_ERRORS[" /Reference/Error-Codes " ]
    REFERENCE --> REF_SHORTCUTS[" /Reference/Keyboard-Shortcuts " ]
    
    ROOT --> FAQ[" /FAQ " ]
    ROOT --> CHANGELOG[" /Changelog " ]
    ROOT --> ROADMAP[" /Roadmap " ]
```

## Migration Timeline

```mermaid
gantt
    title Wiki Content Migration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 - Core
    Home Page           :a1, 2024-02-20, 1d
    Getting Started     :a2, 2024-02-20, 2d
    Installation        :a3, 2024-02-21, 2d
    
    section Phase 2 - User Guide
    Using the Plugin    :b1, 2024-02-22, 3d
    Tips & Tricks       :b2, 2024-02-24, 1d
    Troubleshooting     :b3, 2024-02-25, 2d
    FAQ                 :b4, 2024-02-26, 1d
    
    section Phase 3 - Developer
    Architecture        :c1, 2024-02-27, 2d
    Project Structure   :c2, 2024-02-28, 1d
    API Reference       :c3, 2024-02-29, 3d
    Contributing        :c4, 2024-03-03, 2d
    
    section Phase 4 - Reference
    Configuration       :d1, 2024-03-05, 1d
    Field Types         :d2, 2024-03-06, 1d
    Error Codes         :d3, 2024-03-07, 1d
    Shortcuts           :d4, 2024-03-08, 1d
    
    section Phase 5 - Polish
    Changelog           :e1, 2024-03-09, 1d
    Roadmap             :e2, 2024-03-10, 1d
    Review & Fix        :e3, 2024-03-11, 2d
```

## Content Reuse Mapping

| Wiki Page | Primary Source | Secondary Sources | Notes |
|-----------|----------------|---------------------|-------|
| Home | README.md | - | Condensed overview |
| Getting Started | docs/user-guide.md (lines 1-72) | README.md (82-114) | Quick start guide |
| Installation | README.md (116-156) | - | Multiple methods |
| Index Selection | docs/user-guide.md (54-72) | - | Dropdown usage |
| Document CRUD | docs/user-guide.md (75-243) | - | Create, edit, delete |
| Nested Fields | docs/user-guide.md (246-331) | - | Deep dive needed |
| Configuration | README.md (163-185) | - | YAML config options |
| Troubleshooting | docs/user-guide.md (574-648) | - | Common issues |
| Architecture | docs/architecture.md (1-87) | - | High-level diagrams |
| Project Structure | docs/architecture.md (88-170) | README.md (336-356) | Directory layout |
| API Reference | docs/architecture.md (261-346) | - | All endpoints |
| Contributing | CONTRIBUTING.md | - | Split into sub-pages |
| Configuration Ref | README.md (163-185) | - | Table format |
| FAQ | Various | - | Compiled from issues |
| Changelog | CHANGELOG.md | - | Release history |
