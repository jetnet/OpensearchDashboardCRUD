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
            - generic "Home" [ref=e31]
          - button "Help menu" [ref=e37] [cursor=pointer]:
            - img [ref=e41]
  - generic:
    - generic:
      - region "Notification message list"
  - generic [ref=e46]:
    - banner [ref=e47]:
      - heading "Welcome to OpenSearch Dashboards" [level=1] [ref=e51]
    - generic [ref=e56]:
      - generic [ref=e59]:
        - text: Start by adding your data
        - paragraph [ref=e61]: Add data to your cluster from any source, then analyze and visualize it in real time. Use our solutions to add search anywhere, observe your ecosystem, and protect against security threats.
      - contentinfo [ref=e63]:
        - button "Add data" [ref=e64] [cursor=pointer]:
          - generic [ref=e66]: Add data
        - button "Explore on my own" [ref=e67] [cursor=pointer]:
          - generic [ref=e69]: Explore on my own
```