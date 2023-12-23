<h2 style="margin: 2px 0px 15px;">Projects</h2>

<div class="frontpage-item">
<ol class="bibliography">


{% for link in site.data.projects.main %}

<li>
<div class="pub-row">
  <!-- <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;"> -->
  <div class="" style="position: relative;padding-right: 15px;">
    {% if link.image %} 
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
    {% if link.conference_short %} 
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px; font-size:12pt">
      <div class="title"><a href="{{ link.post }}">{{ link.title }}</a></div>
      <div class="blurb">{{ link.blurb }}</div>
    <div class="links">
      {% if link.post %}
      <a href="{{ link.post }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Post</a>
      {% endif %}
      {% if link.pdf %} 
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.code %} 
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
      {% endif %}
      {% if link.video %}
      <a href="{{ link.video }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
      {% endif %}
      {% if link.page %} 
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.bibtex %} 
      <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">BibTex</a>
      {% endif %}
      {% if link.proceedings %} 
      <a href="{{ link.proceedings }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Proceedings</a>
      {% endif %}
      {% if link.others %} 
      {{ link.others }}
      {% endif %}
    </div>
  </div>
</div>
</li>

<br>

{% endfor %}

</ol>
</div>

