# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner:
      - generic:
        - link "Go to home page" [ref=e7] [cursor=pointer]:
          - /url: /app/home
          - img "OpenSearch Dashboards logo" [ref=e8]
        - generic [ref=e9]:
          - generic [ref=e10]:
            - button "Toggle primary navigation" [ref=e12] [cursor=pointer]:
              - img "Menu" [ref=e16]
            - link "Go to home page" [ref=e20] [cursor=pointer]:
              - /url: /app/home
              - img "OpenSearch Dashboards home" [ref=e25]
          - navigation "breadcrumb" [ref=e28]:
            - generic "Overview" [ref=e31]
          - button "Help menu" [ref=e37] [cursor=pointer]:
            - img [ref=e41]
  - generic:
    - generic:
      - region "Notification message list"
```