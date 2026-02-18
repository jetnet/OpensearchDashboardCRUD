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
              - generic "Loading content" [ref=e25]
          - navigation "breadcrumb" [ref=e26]:
            - generic "Home" [ref=e29]
          - button "Help menu" [ref=e35] [cursor=pointer]:
            - img [ref=e39]
  - generic:
    - generic:
      - region "Notification message list"
  - generic [ref=e44]:
    - banner [ref=e45]:
      - heading "Welcome to OpenSearch Dashboards" [level=1] [ref=e49]
    - generic [ref=e54]:
      - generic [ref=e57]:
        - text: Start by adding your data
        - paragraph [ref=e59]: Add data to your cluster from any source, then analyze and visualize it in real time. Use our solutions to add search anywhere, observe your ecosystem, and protect against security threats.
      - contentinfo [ref=e61]:
        - button "Add data" [ref=e62] [cursor=pointer]:
          - generic [ref=e64]: Add data
        - button "Explore on my own" [ref=e65] [cursor=pointer]:
          - generic [ref=e67]: Explore on my own
```