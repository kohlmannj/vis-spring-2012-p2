<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output
		method="xml"
		indent="yes"
		version="1.0"
		encoding="us-ascii"
	/>
	
	<xsl:variable name="topics" select="document('topics.xml')/tags"/>
	<xsl:variable name="stories" select="document('stories.xml')/node_export"/>
	
	<xsl:template match="/">
		<locations>
			<xsl:apply-templates select="/locations/loc"/>
		</locations>
	</xsl:template>
	
	<xsl:template match="loc">
		<xsl:variable name="locIndex" select="@index"/>
		<xsl:variable name="storiesWithLoc" select="$stories//node[ taxonomy/n1/*[ text()=$locIndex ] ]"/>
		
		<loc>
			<xsl:attribute name="count">
				<xsl:value-of select="count($storiesWithLoc)"/>
			</xsl:attribute>
			<xsl:apply-templates select="@*|*"/>
			<xsl:apply-templates select="$storiesWithLoc"/>
<!-- 			<xsl:for-each select="$topics/tag">
				<xsl:variable name="tagIndex" select="@index"/>
				<xsl:variable name="storiesWithLocAndTag" select="$storiesWithLoc[ taxonomy/n2/*[ text()=$tagIndex ] ]"/>
				
				<xsl:if test="count($storiesWithLocAndTag) > 0">
					<tag>
						<xsl:attribute name="count">
							<xsl:value-of select="count($storiesWithLocAndTag)"/>
						</xsl:attribute>
						<xsl:apply-templates select="@*|*"/>
						<xsl:apply-templates select="$storiesWithLocAndTag"/>
					</tag>
				</xsl:if>
			</xsl:for-each>
 -->		</loc>
	</xsl:template>
	
	<xsl:template match="node">
		<story>
			<xsl:copy-of select="title"/>
			<author><xsl:value-of select="teaser"/></author>
			<xsl:copy-of select="nid"/>
			<date><xsl:value-of select="changed"/></date>
			<author><xsl:value-of select="name"/></author>
			<xsl:apply-templates select="taxonomy/n1"/>
			<xsl:apply-templates select="taxonomy/n2"/>
		</story>
	</xsl:template>
	
	<!-- Locations -->
	<xsl:template match="taxonomy/n1">
		<locations>
			<xsl:for-each select="*[starts-with(name(),'n')]">
				<loc>
					<xsl:attribute name="index">
						<xsl:value-of select="text()"/>
					</xsl:attribute>
				</loc>
			</xsl:for-each>
		</locations>
	</xsl:template>
	
	<!-- Tags -->
	<xsl:template match="taxonomy/n2">
		<tags>
			<xsl:for-each select="*[starts-with(name(),'n')]">
				<tag>
					<xsl:attribute name="index">
						<xsl:value-of select="text()"/>
					</xsl:attribute>
				</tag>
			</xsl:for-each>
		</tags>
	</xsl:template>
	
	<!-- Copy attributes and/or children, depending on Xpath selection. -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>
	
</xsl:stylesheet>
